import { SkeletonCircle } from '@chakra-ui/react';
import React, { FC } from 'react';
import { trpc } from '../../../utils/trpc';
import { ProfilePicture } from './ProfilePicture';

interface Props {
  wallet?: string
}

export const RaffleParticipantAvatar: FC<Props> = ({wallet}) => {
  const {data: user} = trpc.useQuery(['user.get-by-wallet', {wallet: wallet ?? ''}], {enabled: !!wallet})

  return (
    <>
      {user && <ProfilePicture gradientstart={user.gradientStart} gradientend={user.gradientEnd} w='2rem' h='2rem' rounded='full'
                               imageurl={user.profilePictureUrl}/>}
      {!user && <SkeletonCircle w='2rem' h='2rem'/>}
    </>
  )
}
