export default function Step2({ next, back, update }) {
  const handleSubmit = () => {
    update({ audience: 'Small business owners', goals: 'Launch strong brand identity' });
    next();
  };

  return (
    <div>
      <h2>Who are you trying to reach?</h2>
      <input placeholder="Target audience" />
      <h3>What does success look like for this project?</h3>
      <input placeholder="Your goals..." />
      <button onClick={back}>Back</button>
      <button onClick={handleSubmit}>Next</button>
    </div>
  );
}