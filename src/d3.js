const margin = { top: 60, right: 100, bottom: 50, left: 100 };
const w = 1080; // 寬
const h = 300; // 高
const LINE_TIME = 10000;
const POINT_SIZE = (data_count) => {
  if(data_count > 200) return 0;
  else if (data_count > 100) return 1;
  else if (data_count > 50) return 2;
  else if (data_count > 30) return 3;
  else return 4;
};

export const buildGraph = (dataset) => {
  if(dataset[0].date === "查無資料") return;
  const parseTime = d3.timeParse("%Y/%m/%d");
  const formatTime = d3.timeFormat("%Y-%m-%d");
  dataset = dataset.map((d) => {
    return {
      time: parseTime(d.date),
      value: d.avgPrice,
    };
  });
  const maxValue = d3.max(dataset, (d) => d.value);
  const minValue = d3.min(dataset, (d) => d.value);
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, (d) => d.time))
    .range([0, w]);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.value)])
    .range([h, 0]);

  const line = d3
    .line()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.value));

  //增加一個SVG元素
  const svg = d3
    .select("#graph")
    .append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  
  svg.append("rect")
    .attr('id', 'zoom_area')
    .attr("width", w)
    .attr("height", h)
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  const xAxis = d3.axisBottom(xScale).tickSize(-h).tickFormat(formatTime).ticks(w / 100);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis);


  const yAxisLeft = d3.axisLeft(yScale).ticks(4);

  svg
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)")
    .call(yAxisLeft);

  const path = svg
    .append("path")
    .datum(dataset)
    .attr("class", "line")
    .attr("d", line);

  const totalLength = path.node().getTotalLength();

  path
    .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(LINE_TIME)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)

  const points = svg
    .selectAll("dot")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("r", POINT_SIZE(dataset.length))
    .attr("cx", (d) => xScale(d.time))
    .attr("cy", (d) => yScale(d.value))
    .attr("fill", "blue")
    .attr("opacity", 0)
    .transition()
    .duration(1000)
    .delay((d, i) => (i * LINE_TIME) / dataset.length)
    .attr("opacity", 1);

  const labels = svg
    .selectAll("text.label")
    .data(dataset)
    .enter()
    .append("text")
    .attr("class", "tooltip")
    .attr("x", (d) => xScale(d.time))
    .attr("y", (d) => yScale(d.value) - 10)
    .attr("text-anchor", "middle")
    .attr("opacity", 0)
    .text((d) => d.value)
    .transition()
    .duration(1000)
    .delay((d, i) => i * 400)
    .attr("opacity", 1)
    .attr("y", (d) => yScale(d.value) - 10);

  // 添加鼠標事件
  svg
    .selectAll("circle")
    .on("mouseover", function (event, d) {
      d3.select(this)
        .filter(
          (lbl) =>
            lbl.time.getTime() === d.time.getTime() &&
            d.value !== maxValue &&
            d.value !== minValue
        )
        .attr("r", POINT_SIZE(dataset.length) + 3);
      svg
        .selectAll(".tooltip")
        .filter(
          (lbl) =>
            lbl.time.getTime() === d.time.getTime() &&
            d.value !== maxValue &&
            d.value !== minValue
        )
        .transition()
        .duration(200)
        .style("opacity", 1);
    })
    .on("mouseout", function (event, d) {
      d3.select(this)
        .filter(
          (lbl) =>
            lbl.time.getTime() === d.time.getTime() &&
            d.value !== maxValue &&
            d.value !== minValue
        )
        .attr("r", POINT_SIZE(dataset.length));
      svg
        .selectAll(".tooltip")
        .filter(
          (lbl) =>
            lbl.time.getTime() === d.time.getTime() &&
            d.value !== maxValue &&
            d.value !== minValue
        )
        .transition()
        .duration(200)
        .style("opacity", 0);
    });

  // 設置標籤的 data-date 屬性，以便在事件處理器中選擇
  labels.attr("data-date", (d) => d.time);

  const highlightMinMax = () => {
    svg
      .selectAll("circle")
      .filter((d) => d.value === maxValue || d.value === minValue)
      .classed("highlight", true)
      .transition()
      .duration(200)
      .attr("fill", "red")
      .attr("r", POINT_SIZE(dataset.length) + 3);

    svg
      .selectAll("text.highlight-label")
      .data(dataset.filter((d) => d.value === maxValue || d.value === minValue))
      .enter()
      .append("text")
      .attr("class", "highlight-label")
      .attr("x", (d) => xScale(d.time))
      .attr("y", (d) => yScale(d.value) - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "red")
      .style("opacity", 0)
      .text((d) => d.value)
      .transition()
      .duration(200)
      .style("opacity", 1);
  };
  setTimeout(() => highlightMinMax(), LINE_TIME);
};
