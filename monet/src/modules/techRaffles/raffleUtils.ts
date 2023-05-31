import { raffleMinType } from './types';

export function hasRaffleEnded(raffle?: raffleMinType) {
  if (!raffle?.ends) {
    return false
  }

  if (
    raffle.status === 'FINISHED' ||
    raffle.status === 'DRAWN' ||
    raffle.status === 'CANCELLED'
  ) {
    return true
  }

  return raffle.ends.getTime() < new Date().getTime()
}