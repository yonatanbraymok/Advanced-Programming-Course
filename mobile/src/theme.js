export function getColors(isDarkMode) {
  if (isDarkMode) {
    return {
      background: '#121212',
      card: '#1e1e1e',
      text: '#ffffff',
      subtext: '#aaaaaa',
      primary: '#009de0',
      border: '#333333',
    };
  }

  return {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#202125',
    subtext: '#707070',
    primary: '#009de0',
    border: '#e0e0e0',
  };
}
