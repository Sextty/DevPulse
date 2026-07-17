import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Area + line chart of deploys per day with failures overlaid, drawn with D3.
export default function DeployChart({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data.length) return;
    const el = ref.current;
    el.innerHTML = "";

    const margin = { top: 12, right: 16, bottom: 30, left: 40 };
    const width = el.clientWidth - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    const parse = d3.timeParse("%Y-%m-%d");
    const rows = data.map((d) => ({
      date: parse(d.date),
      deploys: d.deploys,
      failures: d.failures,
    }));

    const svg = d3
      .select(el)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().domain(d3.extent(rows, (d) => d.date)).range([0, width]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(rows, (d) => d.deploys) || 1])
      .nice()
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6))
      .selectAll("text")
      .attr("fill", "#7c8aa0");
    svg.append("g").call(d3.axisLeft(y).ticks(5)).selectAll("text").attr("fill", "#7c8aa0");

    const area = d3
      .area()
      .x((d) => x(d.date))
      .y0(height)
      .y1((d) => y(d.deploys))
      .curve(d3.curveMonotoneX);

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.deploys))
      .curve(d3.curveMonotoneX);

    svg.append("path").datum(rows).attr("fill", "rgba(56,189,248,0.18)").attr("d", area);
    svg
      .append("path")
      .datum(rows)
      .attr("fill", "none")
      .attr("stroke", "#38bdf8")
      .attr("stroke-width", 2)
      .attr("d", line);

    // failures as red dots
    svg
      .selectAll(".fail")
      .data(rows.filter((d) => d.failures > 0))
      .join("circle")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.deploys))
      .attr("r", (d) => 2 + d.failures)
      .attr("fill", "#ef4444")
      .attr("opacity", 0.8);
  }, [data]);

  return <div ref={ref} className="chart" />;
}
