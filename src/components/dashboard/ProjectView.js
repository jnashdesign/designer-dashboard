import React from 'react';
import { useParams } from 'react-router-dom';

export default function ProjectView() {
  const { id } = useParams();
  return (
    <div className="container">
      <h2>Project View - {id}</h2>
      <p>Project details, client briefs, and design comps will go here.</p>
    </div>
  );
}