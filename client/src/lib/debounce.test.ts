/**
 * Простые функциональные тесты для debounce логики.
 * Эти тесты НЕ требуют vitest или сложного тестового окружения.
 * Могут быть запущены как обычные функции.
 */

import { createDebouncedAsync } from './debounce'

// Тестовый фреймворк: простые assert функции
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
  console.log(`✓ ${message}`)
}

async function testDebouncedFunctionIsDelayed() {
  const callTimes: number[] = []
  const mockFn = async () => {
    callTimes.push(Date.now())
  }

  const debouncedFn = createDebouncedAsync(mockFn, 100)

  const startTime = Date.now()
  await debouncedFn()
  const endTime = Date.now()

  assert(endTime - startTime >= 100, 'Debounced function should delay at least 100ms')
  assert(callTimes.length === 1, 'Function should be called exactly once')
}

async function testCancelsPreviousCall() {
  let callCount = 0
  const mockFn = async () => {
    callCount++
  }

  const debouncedFn = createDebouncedAsync(mockFn, 100)

  // Вызов 1: будет отменен
  const p1 = debouncedFn()
  // Вызов 2: будет отменен
  const p2 = debouncedFn()
  // Вызов 3: будет выполнен
  const p3 = debouncedFn()

  await p3

  assert(callCount === 1, 'Only the last call should be executed')
}

async function testMultipleSequentialCalls() {
  const results: number[] = []
  const mockFn = async (value: number) => {
    results.push(value)
  }

  const debouncedFn = createDebouncedAsync(mockFn as any, 100)

  const p1 = debouncedFn(1)
  const p2 = debouncedFn(2)
  const p3 = debouncedFn(3)

  await p3

  assert(results.length === 1, 'Should have exactly one call')
  assert(results[0] === 3, 'Should execute with the last argument (3)')
}

async function testTwoSequentialDebounceGroups() {
  let callCount = 0
  const mockFn = async () => {
    callCount++
  }

  const debouncedFn = createDebouncedAsync(mockFn, 50)

  // Первая группа: вызовы 1 и 2, будет выполнен 2
  await debouncedFn()
  await debouncedFn()

  assert(callCount === 1, 'After first group, should have 1 call')

  // Вторая группа: вызовы 3 и 4, будет выполнен 4
  await debouncedFn()
  await debouncedFn()

  assert(callCount === 2, 'After second group, should have 2 calls')
}

async function testPassesErrorsThrough() {
  const error = new Error('Test error')
  const mockFn = async () => {
    throw error
  }

  const debouncedFn = createDebouncedAsync(mockFn, 50)

  try {
    await debouncedFn()
    assert(false, 'Should have thrown an error')
  } catch (e) {
    assert(e === error, 'Should pass through the error')
  }
}

async function testRapidFireCalls() {
  let callCount = 0
  const mockFn = async () => {
    callCount++
  }

  const debouncedFn = createDebouncedAsync(mockFn, 100)

  // Десять быстрых вызовов
  const promises = []
  for (let i = 0; i < 10; i++) {
    promises.push(debouncedFn())
  }

  // Дождемся завершения
  await Promise.all(promises)

  assert(callCount === 1, 'Rapid fire calls should result in single execution')
}

// Запуск всех тестов
async function runTests() {
  console.log('Running debounce tests...\n')

  try {
    await testDebouncedFunctionIsDelayed()
    await testCancelsPreviousCall()
    await testMultipleSequentialCalls()
    await testTwoSequentialDebounceGroups()
    await testPassesErrorsThrough()
    await testRapidFireCalls()

    console.log('\nAll tests passed! ✓')
  } catch (error) {
    console.error('\nTest failed:', error)
    process.exit(1)
  }
}

// Экспортируем для запуска через npm test или import
export { runTests }

// Если запущен напрямую
if (typeof require !== 'undefined' && require.main === module) {
  runTests().catch(console.error)
}
