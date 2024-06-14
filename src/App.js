import logo from './logo.svg';
import './App.css';
import Board from './components/board'
import { useState } from 'react';
import { PIECES } from './constants/pieces';
import { cloneDeep } from 'lodash';

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
    [null,'♟',null,null,null,null,null,null],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♕','♔','♗','♘','♖'],
  ];

  // State variables
  const [currentSquares, setSquares] = useState(initialSquares);
  const [pieceSelected, setPieceSelected] = useState([]);
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);

  let handleClick = pos => {
    const squareClicked = currentSquares[pos[0]][pos[1]];
    if(pieceSelected.length==0){
      if(squareClicked && isPieceWhite(squareClicked)==isWhiteTurn){
        setPieceSelected(pos);
        setAvailableDestinations(calculateAvailableDestinations(pos));
        return;
      }
      else return;
    } 
    if(availableDestinations.some(e=>e.toString()==pos.toString())){ //Click corresponds to valid move
      executeMove(pieceSelected, pos);
      endTurn();
    }
    return;
  };

  let calculateAvailableDestinations = pos => {
    const piece = currentSquares[pos[0]][pos[1]];
    let destinations = pieceConfig[piece].getValidDestinations(pos,isPieceWhite(piece));
    return destinations;
  }

  let getValidPawnDestinations = (pos, isWhite) => {
    const direction = isWhite ? -1 : 1;
    const validMoves = [
                                ...[[direction,-1],[direction,1]]
                                .map((e,i) => e.map((x,j) => x + pos[j]))
                                .filter((move) => isOnBoard(move)
                                                  && isSquareOccupiedOppositeColour(move,isWhite)),
                                ...[[direction,0].map((e,i) => e + pos[i])]
                                .filter((move) => isOnBoard(move)
                                                  && isSquareEmpty(move)),
                                ...(((isWhite && pos[0]==6) || (!isWhite && pos[0]==1)) 
                                      ? [[direction*2,0].map((e,i) => e + pos[i])]
                                        .filter((move) => isSquareEmpty([direction,0].map((e,i)=>e+pos[i]))
                                                          && isSquareEmpty(move)) 
                                      : [])
                              ];
    return validMoves;
  }

  let isPieceWhite = (piece) => piece.charCodeAt(0) <= 0x2659;

  let isOnBoard = pos => pos[0] >= 0 && pos[0] < 8 && pos[1] >= 0 && pos[1] < 8 ;

  let isSquareOccupiedOppositeColour = (pos, isWhite) => currentSquares[pos[0]][pos[1]]
                                                          && isPieceWhite(currentSquares[pos[0]][pos[1]]) != isWhite;

  let isSquareOccupiedSameColour = (pos, isWhite) => currentSquares[pos[0]][pos[1]]
                                                      && isPieceWhite(currentSquares[pos[0]][pos[1]]) == isWhite;
           
  let isSquareEmpty = (pos) => currentSquares[pos[0]][pos[1]] == null;

  let executeMove = (posFrom, posTo) => {
    const movingPiece = currentSquares[posFrom[0]][posFrom[1]];
    const isWhite = isPieceWhite(movingPiece);
    if(isSquareEmpty(posTo)) {
      const newSquares = cloneDeep(currentSquares);
      newSquares[posFrom[0]][posFrom[1]] = null;
      newSquares[posTo[0]][posTo[1]] = movingPiece;
      setSquares(newSquares);
      return;
      // TODO: Pawn promotion, castling, and en passant
    }
  };

  let endTurn = () => {
    setAvailableDestinations([]);
    setPieceSelected([]);
    setIsWhiteTurn(!isWhiteTurn);
    return;
  }

  // Config
  const pieceConfig = {
    [PIECES.WHITE_PAWN]: {
      getValidDestinations: getValidPawnDestinations,
    },
    [PIECES.WHITE_ROOK]: {

    },
    [PIECES.WHITE_KNIGHT]: {

    },
    [PIECES.WHITE_BISHOP]: {

    },
    [PIECES.WHITE_QUEEN]: {

    },
    [PIECES.WHITE_KING]: {

    },
    [PIECES.BLACK_PAWN]: {
      getValidDestinations: getValidPawnDestinations
    },
    [PIECES.BLACK_ROOK]: {

    },
    [PIECES.BLACK_KNIGHT]: {

    },
    [PIECES.BLACK_BISHOP]: {

    },
    [PIECES.BLACK_QUEEN]: {

    },
    [PIECES.BLACK_KING]: {

    },
  };

  return (
    <div className="App" style={appStyle}>
      <Board 
        squares={currentSquares} 
        onClick={pos => handleClick(pos)}
        selectedSquare={pieceSelected}
        availableDestinations={availableDestinations}
      />
    </div>
  );
}

export default App;
