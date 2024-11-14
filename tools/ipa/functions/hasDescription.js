export default (input, _, { path }) => {
  if (!input.description || input.description === "") {
    return [
      {
        // "property" can be used to print the name of the property we are evaluating
        message: `#{{print("property")}}MUST have a description.`,
      },
    ];
  }
}
