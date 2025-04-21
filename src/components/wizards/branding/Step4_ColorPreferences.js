import { useState } from 'react';

export default function Step4({ next, back, update }) {
  const [baseColor, setBaseColor] = useState('#ff0000');
  const [palette, setPalette] = useState([]);

  const generatePalette = () => {
    const shades = [
      baseColor,
      shadeColor(baseColor, -20),
      shadeColor(baseColor, -40),
      shadeColor(baseColor, 20),
      shadeColor(baseColor, 40),
    ];
    setPalette(shades);
  };

  const shadeColor = (color, percent) => {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = Math.min(parseInt(R * (100 + percent) / 100), 255);
    G = Math.min(parseInt(G * (100 + percent) / 100), 255);
    B = Math.min(parseInt(B * (100 + percent) / 100), 255);

    return "#" + [R, G, B].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = () => {
    update({ baseColor, palette });
    next();
  };

  return (
    <div className="container">
      <h2>Pick a starting color for your brand.</h2>
      <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} />
      <button onClick={generatePalette}>Generate Palette</button>
      <div style={{ display: 'flex', marginTop: '1em' }}>
        {palette.map((color, i) => (
          <div key={i} style={{
            backgroundColor: color,
            width: '50px',
            height: '50px',
            border: '1px solid #ccc'
          }} />
        ))}
      </div>
      <div style={{ marginTop: '1em' }}>
        <button onClick={back}>Back</button>
        <button onClick={handleSubmit}>Next</button>
      </div>
    </div>
  );
}