function createElement(tag, { className, text, attrs = {}, dataset = {}, children = [] } = {}) {
  const el = document.createElement(tag);

  if (className) {
    el.className = className;
  }

  if (text != null) {
    el.textContent = text;
  }

  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value == null) return;
    if (value === true) {
      el.setAttribute(key, '');
      return;
    }
    el.setAttribute(key, String(value));
  });

  Object.entries(dataset).forEach(([key, value]) => {
    el.dataset[key] = value;
  });

  children.forEach((child) => {
    if (child != null) el.append(child);
  });

  return el;
}
