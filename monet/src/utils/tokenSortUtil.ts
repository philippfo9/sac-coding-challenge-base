import { Token } from '@prisma/client'

export function compareTokensForSort(a: Token, b: Token) {
  if (a.sort && b.sort) {
    return a.sort - b.sort
  } else if (a.sort) {
    return -1
  } else if (b.sort) {
    return 1
  }

  return a.id - b.id
}