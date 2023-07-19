
let incomeJson
makeChart()
// get most recent date's cases data
async function getNewYorkData(url, target_date) {
    let data = await loadData(url)
    //console.log('date input para', target_date) 
    if (!target_date) {
        // use Brooklyn's data to get most recent date
        //console.log(data)
        target_date = data.c_dates[data.c_dates.length - 1]
        //document.getElementById('date_input').value = target_date
    }

    // check if add a date slider min/max or not 
    // if (!dateRange) {
    //     dateRange = data.c_dates
    //     dateSlider.max = dateRange.length - 1
    //     dateSlider.value = dateSlider.max//dateRange.length - 1
    //     dateOutput.innerText = dateRange[dateSlider.value]
    //     // set min/max date for date input html element
    //     date_input.min = dateRange[0]
    //     date_input.max = dateRange[dateSlider.max]
    // }

    //console.log('current date',target_date)

    const bronx_url = `${BASE_URL}${BRONX}/c_days/${target_date}.json`
    const brooklyn_url = `${BASE_URL}${BROOKLYN}/c_days/${target_date}.json`
    const manhattan_url = `${BASE_URL}${MANHATTAN}/c_days/${target_date}.json`
    const queens_url = `${BASE_URL}${QUEENS}/c_days/${target_date}.json`
    const staten_island_url = `${BASE_URL}${STATEN_ISLAND}/c_days/${target_date}.json`

    let zipcode_population = {}

    let zipcode_json = await Promise.all([
        //loadData(brooklyn_zipcode),
        data,
        loadData(bronx_zipcode),
        loadData(manhattan_zipcode),
        loadData(queens_zipcode),
        loadData(staten_island_zipcode)
    ])
    //console.log('zipcode json', zipcode_json)

    for (let borough of zipcode_json) {
        const regions = borough.c_regions
        for (let zip of regions) {
            zipcode_population[zip.c_ref] = zip.c_people
        }
    }

    let zipcode_names = {
        ...zipcode_json[0].c_sub_captions,
        ...zipcode_json[1].c_sub_captions,
        ...zipcode_json[2].c_sub_captions,
        ...zipcode_json[3].c_sub_captions,
        ...zipcode_json[4].c_sub_captions,
    }
    //console.log('zipcode names',zipcode_names)
    let zipcode_cases = await Promise.all([
        loadData(bronx_url),
        loadData(brooklyn_url),
        loadData(manhattan_url),
        loadData(queens_url),
        loadData(staten_island_url)
    ])

    zipcode_cases = [
        ...zipcode_cases[0],
        ...zipcode_cases[1],
        ...zipcode_cases[2],
        ...zipcode_cases[3],
        ...zipcode_cases[4]
    ]
    //console.log('zipcde_cases (total)', zipcode_cases[0])

    // max of raw totals
    // if (!maxLegendRaw) {
    //     maxLegendRaw = d3.max(zipcode_cases, d => d.totals[METRIC])
    // }
    // console.log('maxLengendRaw', maxLegendRaw)

    // if (raw_or_per100k.value === 'per100k') {
    //     for (let item of zipcode_cases) {
    //         let zip = item.c_ref
    //         let popluation = zipcode_population[zip]
    //         //console.log('item', item)
    //         //console.log('before',item.totals[METRIC])
    //         item.totals[METRIC] = item.totals[METRIC] * (100000/popluation)
    //         //console.log('after',item.totals[METRIC])
    //     }
    // }

    // load income
    if (!incomeJson) incomeJson = await loadData('./nyc-incomeHash.json')

    for (let item of zipcode_cases) {
        let zip = item.c_ref
        let popluation = zipcode_population[zip]
        item.popluation = popluation
        item.name = zipcode_names[zip]
        item.income = incomeJson[zip]
    }

    //console.log('zipcode cases with pop and name', zipcode_cases[0])

    // per100k max total
    // if (!maxLegendPer100K) {
    //     maxLegendPer100K = d3.max(zipcode_cases, d => d.totals[METRIC])
    // }
    // console.log('maxLegendPer100k',maxLegendPer100K)

    // return { zipcode_cases, zipcode_names }
    return zipcode_cases
}

async function makeChart() {
    //if (!incomeJson) incomeJson = await loadData('./nyc-incomeHash.json')
    let res = await getNewYorkData(RECENT_DATES_URL)
    console.log('res', res)

    const containerWidth = 1000; 
    const margin = { top: 20, right: 40, bottom: 30, left: 40 };
    const width = 3680 - margin.left - margin.right;
    const height = 900 - margin.top - margin.bottom;

    const x0 = d3.scaleBand().range([0, width]).paddingOuter(0.5).paddingInner(0.3);//d3.scaleBand().range([0, width]).paddingInner(0.4);
    const x1 = d3.scaleBand();

    const y0 = d3.scaleLinear().range([height, 0]);
    const y1 = d3.scaleLinear().range([height, 0]);

    const color = d3.scaleOrdinal().range([incomeColor, orange]);

    const xAxis = d3.axisBottom(x0).ticks(5);
    const yAxisLeft = d3.axisLeft(y0)//.tickFormat((d) => parseInt(d));
    const yAxisRight = d3.axisRight(y1)//.tickFormat((d) => parseInt(d));
    

    const svg = d3
        .select(".container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const dataset = res.map((item, i) => ({
        zipcode: item.c_ref,
        values: [
            { name: "Deaths", value: item.totals.Deaths },
            { name: "Income", value: item.income },
        ],
    }));
    const sortedDataset = dataset.slice().sort((a,b) => d3.descending(a.values[0].value, b.values[0].value))
    console.log('sorted', sortedDataset)
    x0.domain(sortedDataset.map((d) => d.zipcode));
    x1.domain(["Deaths", "Income"]).rangeRound([0, x0.bandwidth()]);

    // y0.domain([0, d3.max(dataset, (d) => d3.max(d.values, (v) => v.value))]);
    // y1.domain([0, d3.max(dataset, (d) => d3.max(d.values, (v) => v.value))]);
    y0.domain([0, d3.max(sortedDataset, (d) => d.values[0].value)]);
    //console.log('max case', d3.max(dataset, (d) => d.values[0].value))
    y1.domain([0, d3.max(sortedDataset, (d) => d.values[1].value)]);
    //console.log('max income', d3.max(dataset, (d) => d.values[1].value))
    let deathColorScale = d3.scaleLinear().domain([0, d3.max(sortedDataset, (d) => d.values[0].value)]).range([LIGHT_COLOR, INTENSE_COLOR])
    // for(let item of dataset) {
    //     console.log('income',item.values[1].value)
    //     console.log('y0',y0(item.values[1].value))
    // }

    svg.append("g")
        .attr("class", "xAxis x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    d3.selectAll(".xAxis text")
        .attr('text-anchor', 'start')
        .attr('transform', 'rotate(45)');

    svg.append("g")
        .attr("class", "y0 axis")
        .call(yAxisLeft)
        .append("text")
        // .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("fill", orange)
        .text("Deaths");

    svg.select(".y0.axis").selectAll(".tick").style("fill", orange);

    svg.append("g")
        .attr("class", "y1 axis")
        .attr("transform", `translate(${width},0)`)
        .call(yAxisRight)
        .append("text")
        // .attr("transform", "rotate(-90)")
        .attr("y", -16)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("fill", incomeColor)
        .text("Income");

    svg.select(".y1.axis").selectAll(".tick").style("fill", orange);

    const graph = svg.selectAll(".date").data(sortedDataset).enter().append("g").attr("class", "g").attr("transform", (d) => `translate(${x0(d.zipcode)},0)`);

    graph.selectAll("rect")
        .data((d) => d.values)
        .enter()
        .append("rect")
        .attr('data-attribute', d => `${d.name} ${d.value}`)
        .attr("width", x1.bandwidth())
        .attr("x", (d) => {
            if (d.name==='Income') console.log(y0(d.value))
            return x1(d.name)
        })
        .attr("y", (d) => d.name==='Deaths' ? y0(d.value) : y1(d.value))
         //.attr("y", (d) => y0(d.value))
        //.attr("height", (d) => height - y0(d.value))
        .attr("height", (d) => d.name==='Deaths' ? height - y0(d.value) : height - y1(d.value))
         //.style("fill", (d) => color(d.name));
        //.style("fill", (d) => deathColorScale(d.value));
        .style("fill", (d) => d.name === 'Income' ? color(d.name) : deathColorScale(d.value));

    const legend = svg.selectAll(".legend").data(["Deaths", "Income"]).enter().append("g").attr("class", "legend").attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend
        .append("rect")
        .attr("x", width - 48)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend
        .append("text")
        .attr("x", width - 54)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text((d) => d);




    //console.log('income', incomeJson)
}