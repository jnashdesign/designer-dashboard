import { useState } from 'react';

export default function Step5({ next, back, update }) {
  const [inspirationLinks, setInspirationLinks] = useState(['']);
  const [file, setFile] = useState(null);

  const handleLinkChange = (index, value) => {
    const newLinks = [...inspirationLinks];
    newLinks[index] = value;
    setInspirationLinks(newLinks);
  };

  const addLinkField = () => {
    setInspirationLinks([...inspirationLinks, '']);
  };

  const handleSubmit = () => {
    update({ inspirationLinks, inspirationFile: file });
    next();
  };

  return (
    <div className="container">
      <h2>Share your inspiration</h2>
      <p>Seen any logos you like? Drop a link or upload an image.</p>
      {inspirationLinks.map((link, index) => (
        <input key={index} type="url" placeholder="https://example.com" value={link} onChange={(e) => handleLinkChange(index, e.target.value)} style={{ display: 'block', marginBottom: '0.5em' }} />
      ))}
      <button onClick={addLinkField}>Add another link</button>
      <div style={{ marginTop: '1em' }}>
        <label>
          Upload a reference image:
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'block', marginTop: '0.5em' }} />
        </label>
      </div>
      <div style={{ marginTop: '1em' }}>
        <button onClick={back}>Back</button>
        <button onClick={handleSubmit}>Next</button>
      </div>
    </div>
  );
}