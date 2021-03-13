export const clamp = (val: number, min: number, max: number) => {
    return Math.max(Math.min(val, max), min);
}

export const assert = (shouldBeTrue: boolean, message: string) => {
    if (!shouldBeTrue) {
        throw new Error(message)
    }
}

export const shuffle = (list: any[]) => {
  // knuth shuffle
  let currentIndex = list.length;
  let randomIndex = 0;
  let tmp = null;
  while (currentIndex > 0) {
      // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    tmp = list[currentIndex];
    list[currentIndex] = list[randomIndex];
    list[randomIndex] = tmp;
  }
  return list;
}