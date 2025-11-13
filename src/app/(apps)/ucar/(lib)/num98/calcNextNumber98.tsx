export function calcNextNumber98(A) {
  // 8文字目に空白を入れる

  A = String(A).replace(/98 /, '')
  if (String(A).length > 1) {
    A = String(A).replace(/\d$/, '')
  }

  A = Number(A)

  A = A + 1

  // Aに1を足した結果が9000である場合、1として計算
  if (A === 9000) {
    A = 1
  }

  // Aを文字列に変換し、4桁にパディング
  const strA = A.toString().padStart(4, '0')

  // Aの各桁を取得
  const firstDigit = parseInt(strA.charAt(0))
  const secondDigit = parseInt(strA.charAt(1))
  const thirdDigit = parseInt(strA.charAt(2))
  const fourthDigit = parseInt(strA.charAt(3))

  // 数式の計算
  const intermediateSum = 135 + firstDigit * 5 + secondDigit * 4 + thirdDigit * 3 + fourthDigit * 2
  const modValue = intermediateSum % 11
  const result = 11 - modValue
  const finalDigit = result % 10 // 必ず0から9の範囲の1桁の整数になる

  const nextNum = `98 ${strA}${finalDigit}`

  return nextNum
}
