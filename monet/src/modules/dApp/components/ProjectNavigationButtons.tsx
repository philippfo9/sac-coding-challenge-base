import { Button, Link, Stack } from '@chakra-ui/react'
import { FC } from 'react'
import { FiUsers } from 'react-icons/fi'
import { HiOutlineCollection, HiOutlineTicket } from 'react-icons/hi'
import { projectNavigationType } from '../../techRaffles/types'
import NextLink from 'next/link'

interface FilterButtonsProps {
  selectedValue?: string
}

const ProjectNavigationButtons: FC<FilterButtonsProps> = ({
  selectedValue,
}) => {
  const labels = [
    { label: 'Raffles', icon: <HiOutlineTicket />, value: 'RAFFLES' },
    { label: 'Community Members', icon: <FiUsers />, value: 'MEMBERS' },
    {
      label: 'Collections',
      icon: <HiOutlineCollection />,
      value: 'COLLECTIONS',
    },
  ] as { label: string; icon: any; value: projectNavigationType }[]
  return (
    <Stack direction={['column', 'row']}>
      {labels.map((btn, idx) => {
        const isActive = btn.value === selectedValue
        return (
          <NextLink passHref href={`#${btn.value}`} key={btn.value}>
            <Link _hover={{ textDecoration: 'none' }}>
              <Button
                bg={isActive ? 'rgba(0,0,0,0.2)' : 'transparent'}
                h='2.8rem'
                ml={idx !== 0 ? '0.5rem' : '0'}
                color='#fff'
                fontSize='0.875rem'
                fontWeight='600'
                rounded='full'
                border='none'
                _hover={{
                  bg: 'rgba(0,0,0,0.2)',
                }}
                _focus={{ border: 'none' }}
                leftIcon={btn.icon}
              >
                {btn.label}
              </Button>
            </Link>
          </NextLink>
        )
      })}
    </Stack>
  )
}

export default ProjectNavigationButtons
