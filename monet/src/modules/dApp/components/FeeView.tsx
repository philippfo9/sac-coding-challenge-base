import 'react-alice-carousel/lib/alice-carousel.css'
import {
  Table,
  TableContainer,
  Tbody, Td,
  Text, Tfoot, Th, Tr,
  useColorMode,
} from '@chakra-ui/react'
import React, {FC} from 'react'

interface Props {
  fees?: Item[]|null,
}

interface Item {
  amount: number;
  label: string;
  fee: number;
}

export const FeeView: FC<Props> = (props: Props) => {
  const {colorMode} = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const {fees} = props;

  let sum = 0;
  fees?.forEach((i) => sum += i.fee)

  return (<TableContainer>
      <Table variant='simple' fontFamily='Inter'>
        <Tbody color={isDarkMode ? 'white' : 'black'}>
          {fees?.map(i =>  <Tr key={i.label}>
            <Td>{i.amount}x</Td>
            <Td>{i.label}</Td>
            <Td isNumeric>{i.fee}%</Td>
          </Tr>)}

        </Tbody>
        <Tfoot color={isDarkMode ? 'white' : 'black'}>
          <Tr>
            <Th></Th>
            <Th><Text fontWeight={600} textAlign='end' fontFamily='Inter'>Sum Fee</Text></Th>
            <Th isNumeric><Text fontWeight={600} fontFamily='Inter'>{sum}%</Text></Th>
          </Tr>
        </Tfoot>
      </Table>
    </TableContainer>
  )
}
