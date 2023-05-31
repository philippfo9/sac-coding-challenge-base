import {Button, Stack} from '@chakra-ui/react'
import {FC} from 'react'
import { raffleProjectFilterType } from '../../techRaffles/types';

interface FilterButtonsProps {
  selectedValue?: string
  onChange: (btn: raffleProjectFilterType) => void
}

const ProjectRaffleScopeFilterButtons: FC<FilterButtonsProps> = ({
  onChange,
  selectedValue,
}) => {
  const labels = [
    {label: 'All Raffles', value: 'ALL'},
    {label: 'Project Raffles', value: 'PROJECT'},
    {label: 'Community Raffles', value: 'USER'},
  ] as {label: string, value: raffleProjectFilterType}[];
  return (
    <Stack direction={['column', 'row']}>
      {labels.map((btn, idx) => {
        const isActive = btn.value === selectedValue
        return (
          <Button
            key={btn.value}
            bg={isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent'}
            h='2.8rem'
            ml={idx !== 0 ? '0.5rem' : '0'}
            color='#fff'
            fontSize='0.875rem'
            fontWeight='600'
            backdropBlur='blur(10px)'
            rounded='full'
            border='none'
            _hover={{}}
            onClick={() => onChange(btn.value)}
          >
            {btn.label}
          </Button>
        )
      })}
    </Stack>
  )
}

export default ProjectRaffleScopeFilterButtons
