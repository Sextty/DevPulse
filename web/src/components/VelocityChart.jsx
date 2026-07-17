import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Grouped bar chart: commits vs PRs merged per week, drawn with D3.
export default function VelocityChart({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data.length) return;
    const el = ref.current;
    el.innerHTML = "";

    const margin = { top: 12, right: 16, bottom: 40, left: 44 };
    const width = el.clientWidth - margin.left - margin.right;
    const height = 260 - margin.top - margin.bottom;

    const svg = d3
      .select(el)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const weeks = data.map((d) => d.week);
    const x0 = d3.scaleBand().domain(weeks).range([0, width]).padding(0.25);
    const x1 = d3
      .scaleBand()
      .domain(["commits", "prs_merged"])
      .range([0, x0.bandwidth()])
      .padding(0.1);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.max(d.commits, d.prs_merged)) || 1])
      .nice()
      .range([height, 0]);

    const color = { commits: "#10b981", prs_merged: "#38bdf8" };

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x0)
          .tickFormat((d, i) => (i % 3 === 0 ? d.slice(5) : ""))
      )
      .selectAll("text")
      .attr("fill", "#7c8aa0");

    svg.append("g").call(d3.axisLeft(y).ticks(5)).selectAll("text").attr("fill", "#7c8aa0");

    const groups = svg
      .selectAll(".week")
      .data(data)
      .join("g")
      .attr("transform", (d) => `translate(${x0(d.week)},0)`);

    ["commits", "prs_merged"].forEach((key) => {
      groups
        .append("rect")
        .attr("x", x1(key))
        .attr("width", x1.bandwidth())
        .attr("y", height)
        .attr("height", 0)
        .attr("fill", color[key])
        .attr("rx", 2)
        .transition()
        .duration(600)
        .attr("y", (d) => y(d[key]))
        .attr("height", (d) => height - y(d[key]));
    });
  }, [data]);

  return <div ref={ref} className="chart" />;
}
