import 'react-alice-carousel/lib/alice-carousel.css'
import {Button, IconButton, useColorMode} from '@chakra-ui/react'
import React from 'react'
import {useIsRaffleSavedByUser} from '../../techRaffles/hooks/raffle';
import {useUser} from '../../common/auth/authHooks';
import {BsBookmark, BsBookmarkCheckFill} from 'react-icons/bs';
import {trpc} from '../../../utils/trpc';

export const SaveRaffleButton = (props: { raffleId?: string, likes?: number }) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const {isAuthed} = useUser();
  const {data: isSavedByUser, refetch} = useIsRaffleSavedByUser(props.raffleId)

  const saveRaffleMut = trpc.useMutation('raffle.like', {
    onSuccess: () => refetch(),
    onError: () => refetch()
  });

  const IButton = (iprops: { icon: React.ReactElement, onClick: () => void, likes?: number }) => iprops.likes ?
    <Button rightIcon={iprops.icon} bg='transparent' _hover={{
      bg: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f7f7f7',
    }} onClick={iprops.onClick}>
      {iprops.likes}
    </Button>
    : <IconButton
      bg='transparent'
      aria-label='save'
      icon={iprops.icon}
      onClick={iprops.onClick}
      _hover={{
        bg: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f7f7f7',
      }}
    />;

  if (isAuthed && !isSavedByUser) {
    return <IButton icon={<BsBookmark/>} likes={props.likes}
                    onClick={() => saveRaffleMut.mutate({raffleId: props.raffleId ?? ''})}/>
  }

  if (isAuthed && isSavedByUser) {
    return <IButton icon={<BsBookmarkCheckFill/>} likes={props.likes}
                    onClick={() => saveRaffleMut.mutate({raffleId: props.raffleId ?? ''})}/>
  }

  return <></>
}
