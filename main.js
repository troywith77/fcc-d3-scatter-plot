import 'babel-polyfill'
import * as d3 from 'd3'

const fetchData = async () => {
  const data = await d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
  return data
}
  
const main = async () => {
  const data = await fetchData()
  console.log(data)

  // 设置svg的宽，高，padding
  const width = 920, height = 630, padding = 40
  const color = d3.scaleOrdinal(d3.schemeCategory10)

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('id', 'tooltip')
  
  const svg = d3
    .select('#container')
    .append('svg')
    .attr('class', 'graph')
    .attr('width', width)
    .attr('height', height)

  const minYear = d3.min(data, d => d.Year)
  const maxYear = d3.max(data, d => d.Year)
  const xScale = d3
    .scaleLinear()
    .domain([minYear - 1, maxYear + 1])
    .range([padding, width - padding])
  const xAxis = d3
    .axisBottom(xScale)

  svg
    .append('g')
    .attr('transform', `translate(0, ${height - padding})`)
    .attr('id', 'x-axis')
    .call(xAxis)
    
  // const minTime = d3.min(data, d => d.Time)
  // const maxTime = d3.max(data, d => d.Time)
  const timeFormat = d3.timeFormat('%M:%S')
  const yScale = d3
    .scaleTime()
    // .domain([
    //   new Date(Date.UTC(1970, 0, 1, 0, minTime.split(':')[0], minTime.split(':')[1])),
    //   new Date(Date.UTC(1970, 0, 1, 0, maxTime.split(':')[0], maxTime.split(':')[1]))
    // ])
    .range([padding, height - padding])
    yScale.domain(d3.extent(data, d => {
      var parsedTime = d.Time.split(':');
      d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]))
      return d.Time
    }))
    const yAxis = d3
    .axisLeft(yScale)
    .tickFormat(timeFormat)
    
  svg
    .append('g')
    .attr('transform', `translate(${padding}, 0)`)
    .attr('id', 'y-axis')
    .call(yAxis)

  svg
    .selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', 6)
    .attr('fill', d => color(d.Doping === ''))
    .attr('cx', d => xScale(d.Year))
    .attr('cy', d => yScale(d.Time))
    .attr('data-xvalue', d => d.Year)
    .attr('data-yvalue', d => d.Time.toISOString())
    .on('mouseover', (d) => {
      tooltip.style('display', 'flex')
      tooltip.style('top', `${d3.event.pageY}px`)
      tooltip.style('left', `${d3.event.pageX}px`)
      tooltip.html(`
        <p>${d.Name}: ${d.Nationality}</p>
        <p>Year:${d.Year} Time: ${d.Time.getHours()}:${d.Time.getMinutes()}</p>
        <p>${d.Doping}</p>
      `)
    })
    .on('mouseleave', () => {
      tooltip.style('display', 'none')
    })

  const legend = svg
    .selectAll('.legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', (d, i) => `translate(0, ${height / 2 - 20 * i})`)

  legend
    .append('rect')
    .attr('x', width - padding)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', color)

  legend
    .append('text')
    .attr('x', width - padding - 4)
    .attr('y', 9)
    .attr("dy", ".35em")
    .style('font-size', '10px')
    .attr('text-anchor', 'end')
    .text(d => d ? 'Riders with doping allegations' : 'No doping allegations')
}

main()