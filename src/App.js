import { useCallback, useEffect, useState } from 'react'
import { Grid, Typography, Table, TableContainer, IconButton, TableHead, CircularProgress, TableRow, TableBody, TableCell, Container, Tooltip, Link } from '@mui/material'
import { Box } from '@mui/system';

import { ReactComponent as Github } from "./icons/github.svg";

const columns = [
  { id: 'clientName', label: 'Eth2 Client', minWidth: 100, tooltip: 'ETH 2.0 client name' },
  { id: 'clientDist', label: 'Client Distribution', minWidth: 150, align: 'center', tooltip: "ETH 2.0 client distribution (%)" },
  {
    id: 'penalty',
    label: 'Potential Penalty (ETH)',
    minWidth: 170,
    align: 'right',
    tooltip: 'Worse-case staker loss "popularity penalty" due to client bug'
    // format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'unLossEth',
    label: 'Unnecessary Loss',
    minWidth: 170,
    align: 'right',
    tooltip: 'Extra ETH lost vs using least popular client',
    format: (value) => value.toLocaleString('en-US') + 'x',
  },
  {
    id: 'unLossUSD',
    label: 'Unnecessary Loss (USD)',
    minWidth: 170,
    align: 'right',
    tooltip: 'Extra USD lost vs using least popular client',
    format: (value) => '$' + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'),
  },
  {
    id: 'painMeter',
    label: 'Pain Meter',
    minWidth: 170,
    align: 'left',
    tooltip: 'How big is the oof',
    format: (value) => new Array(value).fill('🤬')
  }
];

function createData(clientName, clientDist, penalty, painMeter, minEthLoss, ethUSD) {
  const unLossEth = penalty / minEthLoss
  const unLossUSD = (penalty - minEthLoss) * ethUSD
  return { clientName, clientDist, penalty, unLossEth, unLossUSD, painMeter }
}

const clientDataRaw = [
  // clientName, clientDist, penalty, painMeter
  ['Prysm', '72.80%', 32.0, 10],
  ['Teku', '10.94%', 13.18, 5],
  ['Lighthouse', '8.58%', 8.24, 3],
  ['Nimbus', '6.85%', 6.85, 2],
  ['Lodestar', '0.82%', 0.79, 1]
];

const minEthLoss = 0.79

function App() {
  const [ethUSD, setEthUSD] = useState(null)
  const [rows, setRows] = useState(null)

  const updateData = useCallback(async () => {
    const data = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd').then(x => x.json())
    const ethUsd = data.ethereum.usd

    setEthUSD(ethUSD)

    // Compute 
    const dataProcessed = clientDataRaw.map(([clientName, clientDist, penalty, painMeter]) => {
      return createData(clientName, clientDist, penalty, painMeter, minEthLoss, ethUsd)
    })

    setRows(dataProcessed)
  }, [ethUSD])

  useEffect(() => {
    if (ethUSD === null && rows === null) {
      updateData()
    }
  }, [ethUSD, rows, updateData])

  return (
    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '100vh' }}>
      <Grid item xs={12}>
        <Container>
          <Typography variant="h4">Slashed.info</Typography>
          <Typography variant="subtitle1">On ETH 2.0 <Link href='https://blog.ethereum.org/2020/01/13/validated-staking-on-eth2-1-incentives/'>staking incentives</Link>. Project inspired by this <Link href="https://twitter.com/RyanBerckmans/status/1470876956652679186">tweet</Link>.</Typography>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <Tooltip placement="top" title={column.tooltip}>
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    </Tooltip>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows !== null && rows
                  .map((row) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                        {columns.map((column) => {
                          const value = row[column.id];
                          return (
                            <TableCell key={column.id} align={column.align}>
                              {column.format && typeof value === 'number'
                                ? column.format(value)
                                : value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          {
            rows === null && <Box sx={{
              display: 'flex',
              justifyContent: 'center',
            }} style={{ marginTop: '25px' }}><CircularProgress /></Box>
          }
        </Container>

        <Container>
          <Box display="flex" justifyContent="center" my={4}>
            <Box>
              {[
                {
                  Icon: Github,
                  href: "https://github.com/libevm/slashed.info"
                },
              ].map(({ Icon, href }, i) => (
                <IconButton href={href} target="_blank" size="large">
                  <Icon fill="text.primary" height={20} width={20} />
                </IconButton>
              ))}
            </Box>
          </Box>
        </Container>
      </Grid>
    </Grid>
  );
}

export default App;
