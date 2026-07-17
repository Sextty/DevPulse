import React from "react";

export default function AuthorsTable({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.commits));
  return (
    <table className="authors">
      <thead>
        <tr>
          <th>Author</th>
          <th>Commits</th>
          <th>+ / −</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.author}>
            <td className="mono">{r.author}</td>
            <td>{r.commits}</td>
            <td className="mono">
              <span className="add">+{r.additions}</span>{" "}
              <span className="del">−{r.deletions}</span>
            </td>
            <td className="bar-cell">
              <span
                className="bar"
                style={{ width: `${(r.commits / max) * 100}%` }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
