const BASE_URL = 'https://jht1493.net/COVID-19-Impact/Dashboard/a0/c_data/nyc/c_subs/'
const BRONX = 'Bronx'
const BROOKLYN = 'Brooklyn'
const MANHATTAN = 'Manhattan'
const QUEENS = 'Queens'
const STATEN_ISLAND = 'Staten_Island'
const RECENT_DATES_URL = `${BASE_URL}${BROOKLYN}/c_meta.json`
const METRIC = 'Deaths' // 'Cases'
const brooklyn_zipcode = `${BASE_URL}${BROOKLYN}/c_meta.json`
const bronx_zipcode = `${BASE_URL}${BRONX}/c_meta.json`
const manhattan_zipcode = `${BASE_URL}${MANHATTAN}/c_meta.json`
const queens_zipcode = `${BASE_URL}${QUEENS}/c_meta.json`
const staten_island_zipcode = `${BASE_URL}${STATEN_ISLAND}/c_meta.json`

const incomeColor = '#949494'
const orange = '#d0743c'
const INTENSE_COLOR = '#AA2222'
const LIGHT_COLOR = '#ECD15B'