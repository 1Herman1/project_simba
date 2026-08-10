import { describe, expect, it } from 'vitest'
import { runQuizMatch, claimQuizBonus } from './quiz.service'
import { quizCatalog } from '../test/quiz-catalog.fixture'
import type { QuizAnswers } from '../schemas/quiz.schema'

/**
 * Юнит-тесты ядра подбора корма.
 *
 * БД тут не нужна: подставляем фейковый Prisma-клиент, который отдаёт каталог
 * из prisma/seed.ts (тот же набор SKU и тегов, что на проде) и запоминает
 * созданные quizSession. Так проверяется чистая логика фильтров и скоринга.
 */

type CatalogProduct = (typeof quizCatalog)[number]

interface FakeState {
  sessions: Array<Record<string, unknown>>
  users: Map<string, { bonusPoints: number; bonusLevel: string; welcomeBonusGranted: boolean }>
  bonusTx: Array<{ userId: string; amount: number; type: string }>
}

function makePrisma(catalog: readonly CatalogProduct[] = quizCatalog) {
  const state: FakeState = { sessions: [], users: new Map(), bonusTx: [] }
  let sessionSeq = 0

  const prisma = {
    product: {
      findMany: async ({ where }: any) => {
        const species = where?.quizTags?.has
        return catalog
          .filter((p) => !species || p.quizTags.includes(species))
          .map((p) => ({ ...p, variants: p.variants.filter((v) => true) }))
      },
    },
    quizSession: {
      create: async ({ data }: any) => {
        sessionSeq += 1
        const session = { id: `session-${sessionSeq}`, bonusGranted: false, ...data }
        state.sessions.push(session)
        return session
      },
      update: async ({ where, data }: any) => {
        const s = state.sessions.find((x: any) => x.id === where.id) as any
        Object.assign(s, data)
        return s
      },
      findUnique: async ({ where }: any) =>
        (state.sessions.find((x: any) => x.id === where.id) as any) ?? null,
      findUniqueOrThrow: async ({ where }: any) => {
        const s = state.sessions.find((x: any) => x.id === where.id) as any
        if (!s) throw new Error('session not found')
        return s
      },
      updateMany: async ({ where, data }: any) => {
        const s = state.sessions.find((x: any) => x.id === where.id) as any
        if (!s) return { count: 0 }
        if ('userId' in where && s.userId !== where.userId) return { count: 0 }
        Object.assign(s, data)
        return { count: 1 }
      },
    },
    user: {
      // Эмуляция условного UPDATE ... WHERE welcome_bonus_granted = false —
      // ровно та защёлка, на которой держится однократность бонуса в БД.
      updateMany: async ({ where, data }: any) => {
        const u = state.users.get(where.id)
        if (!u) return { count: 0 }
        if (where.welcomeBonusGranted === false && u.welcomeBonusGranted) return { count: 0 }
        Object.assign(u, data)
        return { count: 1 }
      },
      update: async ({ where, data }: any) => {
        const u = state.users.get(where.id)!
        if (data.bonusPoints?.increment !== undefined) u.bonusPoints += data.bonusPoints.increment
        if (data.bonusLevel) u.bonusLevel = data.bonusLevel
        return { ...u, id: where.id }
      },
      findUniqueOrThrow: async ({ where }: any) => {
        const u = state.users.get(where.id)
        if (!u) throw new Error('user not found')
        return { ...u, id: where.id }
      },
    },
    bonusTransaction: {
      create: async ({ data }: any) => {
        state.bonusTx.push(data)
        return data
      },
    },
  }

  return { prisma: prisma as any, state }
}

function addUser(state: FakeState, id: string) {
  state.users.set(id, { bonusPoints: 0, bonusLevel: 'newcomer', welcomeBonusGranted: false })
}

const dog = (over: Partial<QuizAnswers> = {}): QuizAnswers =>
  ({
    species: 'dog',
    age: 'adult',
    size: 'medium',
    activity: 'normal',
    weight: 'normal',
    health: ['none'],
    avoid: [],
    format: 'dry',
    flavor: 'any',
    philosophy: 'any',
    brand: 'any',
    ...over,
  }) as QuizAnswers

const cat = (over: Partial<QuizAnswers> = {}): QuizAnswers =>
  ({
    species: 'cat',
    age: 'adult',
    sterilized: false,
    lifestyle: 'indoor',
    weight: 'normal',
    health: ['none'],
    avoid: [],
    format: 'dry',
    flavor: 'any',
    philosophy: 'any',
    brand: 'any',
    ...over,
  }) as QuizAnswers

function allCards(res: Awaited<ReturnType<typeof runQuizMatch>>) {
  return [res.main, res.pair, ...res.alternatives].filter(Boolean) as Array<{ id: string }>
}

function tagsOf(id: string): readonly string[] {
  return quizCatalog.find((p) => p.id === id)!.quizTags
}

describe('A. Аллергены — жёсткий фильтр, который не ослабляется никогда', () => {
  const dogAllergenCombos: QuizAnswers[] = []
  for (const age of ['puppy', 'adult', 'senior'] as const) {
    for (const size of ['mini', 'small', 'medium', 'large', 'giant'] as const) {
      for (const format of ['dry', 'wet', 'mixed'] as const) {
        for (const brand of ['farmina', 'happydog', 'any'] as const) {
          dogAllergenCombos.push(
            dog({ age, size, format, brand, health: ['allergy'], avoid: ['chicken'] })
          )
        }
      }
    }
  }

  it(`ни одна из ${dogAllergenCombos.length} комбинаций «собака, аллергия на курицу» не выдаёт corm с contains:chicken`, async () => {
    const { prisma } = makePrisma()
    const violations: string[] = []

    for (const answers of dogAllergenCombos) {
      const res = await runQuizMatch(prisma, answers)
      for (const card of allCards(res)) {
        if (tagsOf(card.id).includes('contains:chicken')) {
          violations.push(`${JSON.stringify(answers)} -> ${card.id}`)
        }
      }
    }

    expect(violations).toEqual([])
  })

  it('кошка с аллергией на рыбу не получает contains:fish даже на максимальном ослаблении', async () => {
    const { prisma } = makePrisma()
    // Комбинация специально «неудобная»: узкий бренд + влажный + senior —
    // подбор вынужден дойти до высоких уровней ослабления.
    const res = await runQuizMatch(
      prisma,
      cat({ age: 'senior', format: 'wet', brand: 'happycat', health: ['allergy'], avoid: ['fish'] })
    )

    for (const card of allCards(res)) {
      expect(tagsOf(card.id)).not.toContain('contains:fish')
    }
  })

  it('два аллергена сразу (курица + зерно) исключаются оба', async () => {
    const { prisma } = makePrisma()
    const res = await runQuizMatch(
      prisma,
      dog({ health: ['allergy'], avoid: ['chicken', 'grain'], size: 'giant', format: 'mixed' })
    )

    for (const card of allCards(res)) {
      expect(tagsOf(card.id)).not.toContain('contains:chicken')
      expect(tagsOf(card.id)).not.toContain('contains:grain')
    }
  })

  it('avoid:unknown даёт монопротеин/гипоаллергенный и дисклеймер про ветврача', async () => {
    const { prisma } = makePrisma()
    const res = await runQuizMatch(prisma, dog({ health: ['allergy'], avoid: ['unknown'], size: 'small', age: 'puppy' }))

    expect(res.disclaimers.some((d) => d.includes('ветеринарного врача'))).toBe(true)
    const mainTags = tagsOf(res.main.id)
    expect(
      mainTags.includes('special:monoprotein') || mainTags.includes('special:hypoallergenic')
    ).toBe(true)
  })
})

describe('B. Гарантия минимум трёх карточек', () => {
  const combos: Array<{ label: string; answers: QuizAnswers }> = []
  for (const age of ['puppy', 'adult', 'senior'] as const) {
    for (const size of ['mini', 'small', 'medium', 'large', 'giant'] as const) {
      for (const format of ['dry', 'wet', 'mixed'] as const) {
        for (const philosophy of ['grainfree', 'classic', 'any'] as const) {
          combos.push({
            label: `dog/${age}/${size}/${format}/${philosophy}`,
            answers: dog({ age, size, format, philosophy }),
          })
        }
      }
    }
  }
  for (const age of ['kitten', 'adult', 'senior'] as const) {
    for (const format of ['dry', 'wet', 'mixed'] as const) {
      for (const health of [['none'], ['hairball'], ['urinary'], ['digestion', 'skin']] as const) {
        combos.push({
          label: `cat/${age}/${format}/${health.join('+')}`,
          answers: cat({ age, format, health: [...health] as QuizAnswers['health'] }),
        })
      }
    }
  }

  it(`каждая из ${combos.length} комбинаций отдаёт >= 3 карточек`, async () => {
    const { prisma } = makePrisma()
    const failures: string[] = []

    for (const { label, answers } of combos) {
      const res = await runQuizMatch(prisma, answers)
      const count = allCards(res).length
      if (count < 3) failures.push(`${label}: ${count}`)
    }

    expect(failures).toEqual([])
  })

  it('если фильтры ослаблялись — это честно помечено в relaxed и fallbackNote', async () => {
    const { prisma } = makePrisma()
    // У Happy Dog в каталоге всего 2 SKU — бренд обязан ослабнуть.
    const res = await runQuizMatch(prisma, dog({ brand: 'happydog', size: 'giant', age: 'senior' }))

    expect(res.relaxed.length).toBeGreaterThan(0)
    expect(res.fallbackNote).not.toBeNull()
  })

  it('карточки в ответе не дублируются', async () => {
    const { prisma } = makePrisma()
    const res = await runQuizMatch(prisma, dog({ format: 'mixed' }))
    const ids = allCards(res).map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('C. Скоринг: здоровье ×3, философия ×2, мягкие ×1', () => {
  it('корм с совпадением по здоровью обгоняет корм только с совпадением по вкусу', async () => {
    const { prisma } = makePrisma()
    const res = await runQuizMatch(prisma, cat({ health: ['hairball'], lifestyle: 'indoor' }))

    expect(tagsOf(res.main.id)).toContain('health:hairball')
    expect(res.main.matchScore).toBeGreaterThanOrEqual(3)
  })

  it('стерилизованная кошка получает корм для стерилизованных, даже если health не отмечен', async () => {
    const { prisma } = makePrisma()
    const res = await runQuizMatch(prisma, cat({ sterilized: true }))

    expect(tagsOf(res.main.id)).toContain('health:sterilized')
  })

  it('matchScore главной карточки не ниже, чем у альтернатив', async () => {
    const { prisma } = makePrisma()
    const res = await runQuizMatch(prisma, dog({ health: ['joints'], size: 'large', philosophy: 'classic' }))

    for (const alt of res.alternatives) {
      expect(res.main.matchScore).toBeGreaterThanOrEqual(alt.matchScore)
    }
  })
})

describe('D. format:mixed — пара сухой + влажный', () => {
  it('при mixed отдаётся пара другого формата', async () => {
    const { prisma } = makePrisma()
    const res = await runQuizMatch(prisma, cat({ format: 'mixed' }))

    expect(res.pair).not.toBeNull()
    const mainFormat = tagsOf(res.main.id).includes('format:dry') ? 'format:dry' : 'format:wet'
    const pairFormat = mainFormat === 'format:dry' ? 'format:wet' : 'format:dry'
    expect(tagsOf(res.pair!.id)).toContain(pairFormat)
  })

  it('если влажного корма в каталоге нет вовсе — pair честно null, а не подделка', async () => {
    const dryOnly = quizCatalog.filter((p) => p.quizTags.includes('format:dry'))
    const { prisma } = makePrisma(dryOnly)
    const res = await runQuizMatch(prisma, cat({ format: 'mixed' }))

    expect(res.pair).toBeNull()
    expect(allCards(res).length).toBeGreaterThanOrEqual(3)
  })
})

describe('E. Бонус 300 — начисляется один раз', () => {
  it('повторный проход квиза тем же пользователем не даёт бонус второй раз', async () => {
    const { prisma, state } = makePrisma()
    addUser(state, 'u1')

    const first = await runQuizMatch(prisma, dog(), 'u1')
    const second = await runQuizMatch(prisma, cat(), 'u1')

    expect(first.bonus.status).toBe('granted')
    expect(second.bonus.status).toBe('already_granted')
    expect(state.users.get('u1')!.bonusPoints).toBe(300)
    expect(state.bonusTx.filter((t) => t.type === 'quiz')).toHaveLength(1)
  })

  it('два параллельных POST /match от одного пользователя дают ровно одно начисление', async () => {
    const { prisma, state } = makePrisma()
    addUser(state, 'u2')

    const [a, b] = await Promise.all([
      runQuizMatch(prisma, dog(), 'u2'),
      runQuizMatch(prisma, dog({ format: 'wet' }), 'u2'),
    ])

    const statuses = [a.bonus.status, b.bonus.status].sort()
    expect(statuses).toEqual(['already_granted', 'granted'])
    expect(state.users.get('u2')!.bonusPoints).toBe(300)
  })

  it('гость не получает бонус, но получает sessionId для последующего claim', async () => {
    const { prisma } = makePrisma()
    const res = await runQuizMatch(prisma, dog())

    expect(res.bonus.status).toBe('guest')
    expect(res.bonus.balance).toBeNull()
    expect(res.sessionId).toBeTruthy()
  })

  it('claim после логина привязывает гостевую сессию и начисляет ровно один раз', async () => {
    const { prisma, state } = makePrisma()
    addUser(state, 'u3')

    const guest = await runQuizMatch(prisma, dog())
    const first = await claimQuizBonus(prisma, guest.sessionId, 'u3')
    const second = await claimQuizBonus(prisma, guest.sessionId, 'u3')

    expect(first).toMatchObject({ granted: true, amount: 300, balance: 300 })
    expect(second.granted).toBe(false)
    expect(state.users.get('u3')!.bonusPoints).toBe(300)
  })

  it('чужую сессию забрать нельзя (IDOR)', async () => {
    const { prisma, state } = makePrisma()
    addUser(state, 'owner')
    addUser(state, 'attacker')

    const own = await runQuizMatch(prisma, dog(), 'owner')

    await expect(claimQuizBonus(prisma, own.sessionId, 'attacker')).rejects.toThrow('IDOR')
    expect(state.users.get('attacker')!.bonusPoints).toBe(0)
  })

  it('claim несуществующей сессии — ошибка, а не молчаливое начисление', async () => {
    const { prisma, state } = makePrisma()
    addUser(state, 'u4')

    await expect(claimQuizBonus(prisma, 'session-404', 'u4')).rejects.toThrow('Session not found')
    expect(state.users.get('u4')!.bonusPoints).toBe(0)
  })
})

describe('F. Предпочтение бренда', () => {
  it('выбранный бренд Farmina выигрывает главную карточку', async () => {
    const { prisma } = makePrisma()
    const res = await runQuizMatch(prisma, dog({ brand: 'farmina', age: 'adult', size: 'medium' }))

    expect(res.main.brandName).toBe('Farmina')
  })

  // Слаг бренда в ответах квиза — 'happydog'/'happycat', а в базе (seed.ts) —
  // 'happy-dog'/'happy-cat'. Каталог тут специально устроен так, что жёсткий
  // фильтр по бренду на уровне 0 обязан сработать: три подходящих Happy Dog.
  it('выбранный бренд Happy Dog уважается, когда его товаров достаточно', async () => {
    const happyDog = quizCatalog
      .filter((p) => p.quizTags.includes('species:dog') && p.quizTags.includes('format:dry'))
      .slice(0, 3)
      .map((p) => ({
        ...p,
        id: `hd-${p.id}`,
        slug: `hd-${p.slug}`,
        brand: { name: 'Happy Dog', slug: 'happy-dog' },
        quizTags: ['species:dog', 'age:all', 'size:all', 'format:dry', 'philosophy:classic'],
      }))
    const others = quizCatalog.filter((p) => p.quizTags.includes('species:dog'))
    const { prisma } = makePrisma([...happyDog, ...others] as unknown as typeof quizCatalog)

    const res = await runQuizMatch(prisma, dog({ brand: 'happydog', age: 'adult', format: 'dry' }))

    expect(res.main.brandName).toBe('Happy Dog')
  })
})
