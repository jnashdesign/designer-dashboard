export default function Step6({ back, update }) {
  const handleSubmit = () => {
    update({ submitted: true });
    alert("Thanks! We'll review your answers and follow up soon.");
  };

  return (
    <div className="container">
      <h2>You're all set!</h2>
      <p>Thanks for sharing all this info—it really helps us tailor the design to your vision.</p>
      <p>If there’s anything else you’d like us to know, you can add it below:</p>
      <textarea rows="4" cols="50" placeholder="Any final notes?" onBlur={(e) => update({ finalNotes: e.target.value })} style={{ display: 'block', marginTop: '0.5em' }} />
      <div style={{ marginTop: '1em' }}>
        <button onClick={back}>Back</button>
        <button onClick={handleSubmit}>Finish</button>
      </div>
    </div>
  );
}