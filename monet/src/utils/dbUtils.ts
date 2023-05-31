import { subDays } from 'date-fns';
import { timeframeFilterType } from '../modules/techRaffles/types';
import { getStandardFormattedDateTime } from './dateUtil';

export function getMinDateStringForTimeFrame(timeframe: timeframeFilterType) {
  if (timeframe === 'ALLTIME') return '1970-01-01 01-01-01'

  const daysToFilterBy = timeframe === 'WEEKLY' ? 7 : timeframe === 'MONTHLY' ? 30 : 30;

  return getStandardFormattedDateTime(
    subDays(new Date(), daysToFilterBy)
  )
}

export function filterRaffleEndsByTimeFrame(timeframe: timeframeFilterType) {
  const dateStringForFilter = getMinDateStringForTimeFrame(timeframe)
  console.log({dateStringForFilter});
  
  const dateFilter = dateStringForFilter ? ` AND r.ends > ${dateStringForFilter}` : ''
  console.log({dateFilter});
  
  return dateFilter
}