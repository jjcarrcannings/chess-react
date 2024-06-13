const boardSquareStyles = {
    aspectRatio: '1/1',
    width: '100%',
    height: '100%',
    fontSize: '5vw',
    justifyContent: 'center',
    alignItems: 'center',
}

function Square({isWhite, piece=null, isSelected=false, isValidDestination=false, onClick}) {
    let backgroundColor = isWhite ? "#fff8dc" : "#cdaa7d";
    return(
        <div className="square" style={Object.assign({}, boardSquareStyles, {backgroundColor})} onClick={onClick}>
            {piece}
        </div>
    )
}

export default Square;