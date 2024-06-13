import logo from './logo.svg';
import './App.css';
import Board from './components/board'
import { useState } from 'react';

const appStyle = {
  height: '49vw',
  width: '49vw',
  justifyContent: 'center'
}

function App() {

  // Initial State
  let initialSquares = [
    ['♜','♞','♝','♛','♚','♝','♞','♜'],
    ['♟','♟','♟','♟','♟','♟','♟','♟'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♕','♔','♗','♘','♖'],
  ];

  // State variables
  const [currentSquares, setSquares] = useState(initialSquares);
  const [pieceSelected, setPieceSelected] = useState(null);
  const [availableDestinations, setAvailableDestinations] = useState([]);

  let handleClick = pos => {
    
    return
  };
  return (
    <div className="App" style={appStyle}>
      <Board squares={currentSquares} onClick={pos => handleClick(pos)}/>
    </div>
  );
}

export default App;
