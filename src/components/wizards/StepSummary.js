export default function StepSummary({ back, formData, finish }) {
    return (
      <div className="container">
        <h2>Review your answers</h2>
        
        <ul>
          <li><strong>Business Name:</strong> {formData.businessName}</li>
          <li><strong>Description:</strong> {formData.description}</li>
          <li><strong>Audience:</strong> {formData.audience}</li>
          <li><strong>Goals:</strong> {formData.goals}</li>
          <li><strong>Style:</strong> {formData.selectedStyles?.join(', ')}</li>
          <li><strong>Words:</strong> {formData.descriptiveWords?.join(', ')}</li>
          <li><strong>Base Color:</strong> {formData.baseColor}</li>
          <li><strong>Palette:</strong>
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              {formData.palette?.map((color, i) => (
                <div key={i} style={{ background: color, width: 20, height: 20 }} />
              ))}
            </div>
          </li>
          <li><strong>Inspiration Links:</strong>
            <ul>{formData.inspirationLinks?.map((link, i) => <li key={i}>{link}</li>)}</ul>
          </li>
        </ul>
  
        <button onClick={back}>Back</button>
        <button onClick={finish}>Submit</button>
      </div>
    );
  }
  