export default (collection) => {
  const errors = [];
  const items = collection.item;
  for (let item of items) {
    if (!item.request && !item.description) {
      errors.push({ message: `Folder "${item.name}" requires description.` });
    }
  }
  if (errors.length > 0) {
    return errors;
  }
};
