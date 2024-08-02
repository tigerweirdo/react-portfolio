import './index.scss'

const AnimatedLetters = ({ letterClass, strArray, idx, additionalClass = '' }) => {
  return (
    <span>
      {strArray.map((char, i) => (
        <span key={char + i} className={`${letterClass} _${i + idx} ${additionalClass}`}>
          {char}
        </span>
      ))}
    </span>
  );
};

export default AnimatedLetters;