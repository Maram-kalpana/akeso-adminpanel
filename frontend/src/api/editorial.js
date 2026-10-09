import resourceApi from "./resource";
export const editorialApi = (kind) => resourceApi(`/editorial/${kind}`);
