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
    [null,null,null,null,null,null,null,null],
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
    if(squareClicked && isPieceWhite(squareClicked)==isWhiteTurn){ // Click is on active player's colour
        setPieceSelected(pos);
        setAvailableDestinations(calculateAvailableDestinations(pos));
    } else if(availableDestinations.some(e=>e.toString()==pos.toString())){ // Click corresponds to valid move destination
      executeMove(pieceSelected, pos);
      endTurn();
    } else{ // Invalid click
      setPieceSelected([]);
      setAvailableDestinations([]);
    }
    return;
  };

  let calculateAvailableDestinations = (pos, squares=currentSquares) => {
    const piece = squares[pos[0]][pos[1]];
    return pieceConfig[piece].getValidDestinations(pos,isPieceWhite(piece));

  }

  let getValidPawnDestinations = (pos, isWhite, squares=currentSquares) => {
    const direction = isWhite ? -1 : 1;
    const validMoves = [
                                ...[[direction,-1],[direction,1]]
                                .map((e,i) => e.map((x,j) => x + pos[j]))
                                .filter((move) => isOnBoard(move)
                                                  && isSquareOccupiedOppositeColour(move,isWhite, squares)),
                                ...[[direction,0].map((e,i) => e + pos[i])]
                                .filter((move) => isOnBoard(move)
                                                  && isSquareEmpty(move, squares)),
                                ...(((isWhite && pos[0]==6) || (!isWhite && pos[0]==1)) 
                                      ? [[direction*2,0].map((e,i) => e + pos[i])]
                                        .filter((move) => isSquareEmpty([direction,0].map((e,i)=>e+pos[i]), squares)
                                                          && isSquareEmpty(move, squares)) 
                                      : [])
                              ];
    return validMoves.filter((move) => !isKingInCheckIfMove(pos, move, isWhite, squares));
  }

  let getValidRookDestinations = (pos, isWhite, squares=currentSquares) => {  
    let validMoves = [];
    for(let moveDirection of [[-1,0],[0,-1],[1,0],[0,1]]){
      let currentMove = moveDirection.map((e,i)=>e+pos[i]);
      while(isOnBoard(currentMove)){
        if(isSquareEmpty(currentMove)){
          validMoves.push(currentMove);
        } else if(isSquareOccupiedSameColour(currentMove,isWhite)){ 
          break;
        } else{
          validMoves.push(currentMove);
          break;
        }
        currentMove = moveDirection.map((e,i)=>e+currentMove[i]);
      }
    }
    return validMoves.filter((move => !isKingInCheckIfMove(pos, move, isWhite, squares)));
  }

  let getValidKnightDestinations = (pos, isWhite, squares=currentSquares) => {
    const jumps = [[-2,-1],[-2,1],[-1,2],[1,2],[2,1],[2,-1],[1,-2],[-1,-2]];
    let validMoves = jumps.map( (jump,i) => jump.map( (e,j) => e + pos[j] ) )
                      .filter((move) => isOnBoard(move) && !isSquareOccupiedSameColour(move, isWhite)
                                                        && !isKingInCheckIfMove(pos, move, isWhite, squares));
    return validMoves;
  }

  let getValidBishopDestinations = (pos, isWhite, squares=currentSquares) => {
    let validMoves = [];
    for(let moveDirection of [[-1,-1],[1,-1],[1,1],[-1,1]]){
      let currentMove = moveDirection.map((e,i)=>e+pos[i]);
      while(isOnBoard(currentMove)){
        if(isSquareEmpty(currentMove)){
          validMoves.push(currentMove);
        } else if(isSquareOccupiedSameColour(currentMove,isWhite)){ 
          break;
        } else{
          validMoves.push(currentMove);
          break;
        }
        currentMove = moveDirection.map((e,i)=>e+currentMove[i]);
      }
    }
    return validMoves.filter((move => !isKingInCheckIfMove(pos, move, isWhite, squares)));
  }

  let getValidQueenDestinations = (pos, isWhite, squares=currentSquares) => {
    let validMoves = [];
    for(let moveDirection of [[-1,-1],[1,-1],[1,1],[-1,1],[-1,0],[0,-1],[1,0],[0,1]]){
      let currentMove = moveDirection.map((e,i)=>e+pos[i]);
      while(isOnBoard(currentMove)){
        if(isSquareEmpty(currentMove)){
          validMoves.push(currentMove);
        } else if(isSquareOccupiedSameColour(currentMove,isWhite)){ 
          break;
        } else{
          validMoves.push(currentMove);
          break;
        }
        currentMove = moveDirection.map((e,i)=>e+currentMove[i]);
      }
    }
    return validMoves.filter((move => !isKingInCheckIfMove(pos, move, isWhite, squares)));
  }

  let getValidKingDestinations = (pos, isWhite, squares=currentSquares) => {
    const moves = [[-1,-1],[1,-1],[1,1],[-1,1],[-1,0],[0,-1],[1,0],[0,1]];
    let validMoves = moves.map((move,i)=>move.map((e,j)=>e+pos[j]))
                      .filter((move) => isOnBoard(move) && !isSquareOccupiedSameColour(move, isWhite)
                                                        && !isKingInCheckIfMove(pos, move, isWhite, squares));
    //TODO: Castling
    return validMoves;
  }

  let getAllPieceDestinationsForColour = (isWhite) => {
    let result = []
    for(let i=0; i<8; i++){
      for(let j=0; j<8; j++){
        const piece = currentSquares[i][j];
        if(piece && isPieceWhite(piece)==isWhite){
          result.push(pieceConfig[piece].getValidDestinations([i,j],isWhite));
        }
      }
    }
    return result;
  }

  let isKingInCheckIfMove = (posFrom, posTo, isWhite, squares) => {
    // TODO: Add logic
    return false;
  }

  let isCheckByColour = (squares, isWhite) => {
    
  }

  let isPieceWhite = (piece) => piece.charCodeAt(0) <= 0x2659;

  let isOnBoard = pos => pos[0] >= 0 && pos[0] < 8 && pos[1] >= 0 && pos[1] < 8 ;

  let isSquareOccupiedOppositeColour = (pos, isWhite, squares=currentSquares) => squares[pos[0]][pos[1]]
                                                          && isPieceWhite(squares[pos[0]][pos[1]]) != isWhite;

  let isSquareOccupiedSameColour = (pos, isWhite, squares=currentSquares) => squares[pos[0]][pos[1]]
                                                      && isPieceWhite(currentSquares[pos[0]][pos[1]]) == isWhite;
           
  let isSquareEmpty = (pos, squares=currentSquares) => squares[pos[0]][pos[1]] == null;

  let executeMove = (posFrom, posTo) => {
    const movingPiece = currentSquares[posFrom[0]][posFrom[1]];
    const isWhite = isPieceWhite(movingPiece);
    if(isSquareEmpty(posTo)) { // Move to open square
      const newSquares = cloneDeep(currentSquares);
      newSquares[posFrom[0]][posFrom[1]] = null;
      newSquares[posTo[0]][posTo[1]] = movingPiece;
      setSquares(newSquares);
      // TODO: Pawn promotion, castling, and en passant
      return;
    } else if (isSquareOccupiedOppositeColour(posTo, isWhite)) { // Capture move
      const newSquares = cloneDeep(currentSquares);
      newSquares[posFrom[0]][posFrom[1]] = null;
      newSquares[posTo[0]][posTo[1]] = movingPiece;
      setSquares(newSquares);
      // TODO: Possibly combine with other move logic above
      return;
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
      getValidDestinations: getValidRookDestinations,
    },
    [PIECES.WHITE_KNIGHT]: {
      getValidDestinations: getValidKnightDestinations,
    },
    [PIECES.WHITE_BISHOP]: {
      getValidDestinations: getValidBishopDestinations,
    },
    [PIECES.WHITE_QUEEN]: {
      getValidDestinations: getValidQueenDestinations,
    },
    [PIECES.WHITE_KING]: {
      getValidDestinations: getValidKingDestinations,
    },
    [PIECES.BLACK_PAWN]: {
      getValidDestinations: getValidPawnDestinations
    },
    [PIECES.BLACK_ROOK]: {
      getValidDestinations: getValidRookDestinations,
    },
    [PIECES.BLACK_KNIGHT]: {
      getValidDestinations: getValidKnightDestinations,
    },
    [PIECES.BLACK_BISHOP]: {
      getValidDestinations: getValidBishopDestinations,
    },
    [PIECES.BLACK_QUEEN]: {
      getValidDestinations: getValidQueenDestinations,
    },
    [PIECES.BLACK_KING]: {
      getValidDestinations: getValidKingDestinations,
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
