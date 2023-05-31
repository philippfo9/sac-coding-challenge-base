import 'react-alice-carousel/lib/alice-carousel.css'
import {
  Button,
  Center,
  Spinner,
  Text,
  useInterval
} from '@chakra-ui/react'
import React, {
  FC,
  useMemo,
  useState
} from 'react'
import { trpc } from '../../../utils/trpc';
import { useUser } from '../../common/auth/authHooks';
import toast from 'react-hot-toast';

interface Props {
  text?: React.ReactNode,
  onRefresh?: () => void,
}

export const CommunitiesRefreshButton: FC<Props> = ({text, onRefresh}) => {
  const {data: user, refetchUser} = useUser();
  let lastHolderCheck = user?.lastHolderCheck;
  const [refreshAllowedIn, setRefreshAllowedIn] = useState<string>('')

  const refreshAllowed = useMemo(() => {
    if (!lastHolderCheck) {
      return true;
    }
    const date = new Date();
    date.setMinutes(date.getMinutes() - 10);
    return lastHolderCheck.getTime() < date.getTime();
  }, [lastHolderCheck, refreshAllowedIn])

  useInterval(() => {
    if (!lastHolderCheck) {
      return;
    }
    const date = new Date();
    date.setMinutes(date.getMinutes() - 10);
    setRefreshAllowedIn(((lastHolderCheck.getTime() - date.getTime()) / 1000).toFixed(0))
  }, 1000)

  const checkHolderMut = trpc.useMutation('user.checkHolder', {
    onSuccess: () => {
      lastHolderCheck = new Date();
      void refetchUser()
      if (onRefresh) {
        onRefresh();
      }
      toast('Depending on your community count it can take some minutes for all communities to show up', {})
    },
    onError: () => void refetchUser()
  })

  return (<Button variant='outlined' mb='2rem' disabled={!refreshAllowed || checkHolderMut.isLoading} onClick={() => {
      setRefreshAllowedIn('600');
      checkHolderMut.mutate()
    }}>
      {checkHolderMut.isLoading ? <Center w='15rem'><Spinner/></Center> : (
        <>{text} {!refreshAllowed && <Text ml={2}>({refreshAllowedIn})</Text>}</>
      )}
    </Button>
  )
}
