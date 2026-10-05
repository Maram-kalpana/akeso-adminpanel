export default function RepeatableList({ label, values, onChange, placeholder }) {
  const items = values.length ? values : [''];

  function update(index, next) {
    const copy = [...items];
    copy[index] = next;
    onChange(copy);
  }

  function add() {
    onChange([...items, '']);
  }

  function remove(index) {
    const copy = items.filter((_, i) => i !== index);
    onChange(copy.length ? copy : ['']);
  }

  return (
    <div className="full">
      <label>{label}</label>
      {items.map((item, index) => (
        <div className="repeat-row" key={index}>
          <input value={item} placeholder={placeholder} onChange={(e) => update(index, e.target.value)} />
          <button className="btn secondary small" type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button className="btn secondary small" type="button" onClick={add}>Add row</button>
    </div>
  );
}
