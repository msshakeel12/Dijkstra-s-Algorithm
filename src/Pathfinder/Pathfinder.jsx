import React, {Component} from 'react';
import Node from './Node';
import {dijkstra, getNodesInShortestPathOrder} from './dijkstra';
import './Pathfinder.css';

const START_NODE_ROW = 8;
const START_NODE_COL = 10;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class Pathfinder extends Component {
  constructor() {
    super();  
    console.log("constructor");
    this.state = {
      grid: [],
      mouseIsPressed: false,
    };
  }

  componentDidMount() {

    console.log("DidMount")    
    const grid = getInitialGrid();
    this.setState({grid});

  }

  handleMouseDown(row, col) {
    console.log("mousedown");
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid, mouseIsPressed: true});
    console.log(newGrid[row][col].isWall)
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid});
  }

  handleMouseUp() {
    this.setState({mouseIsPressed: false});
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder, startNode,finishNode) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        let start=false;
        if((node.row==START_NODE_ROW && node.col==START_NODE_COL)||(node.row==FINISH_NODE_ROW && node.col==FINISH_NODE_COL)){
          start=true
        }
        if(!start){        
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
        }
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        let start=false;
        const node = nodesInShortestPathOrder[i];
        if((node.row==START_NODE_ROW && node.col==START_NODE_COL)||(node.row==FINISH_NODE_ROW && node.col==FINISH_NODE_COL)){
          start=true
        }
        if(!start){        
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
        }
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    const {grid} = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder, startNode,finishNode);
  }

  createMaze() {
    this.clearMaze();
    let {grid} = this.state;
    grid.map((row,id) =>{
      row.map((node, nodeIdx) => {
      const {row, col, isFinish, isStart, isWall} = node;
      let random = Math.random();
      let randomTwo = isWall === false ? 0.25 : 0.35;
      if(random < randomTwo && isWall===false && !isStart && !isFinish){
        const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
        this.setState({grid: newGrid});
        
      }

      console.log("created random maze");
      });
    });
  }

  clearMaze(reset){
    let {grid}=this.state;
    grid.map((row,id) =>{
      row.map((node, nodeIdx) => {
      const {row, col, isFinish, isStart, isWall} = node;
      console.log("clear");
      if(!isFinish && !isStart)
      document.getElementById(`node-${node.row}-${node.col}`).className =
      'node';
      
      

      
      if(isWall===true){
          const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
          this.setState({grid: newGrid});  
        }

      });
    });

  }

  render() {


    const {grid, mouseIsPressed} = this.state;

    return (
      
      <React.Fragment>
      <nav className="title flex-column glyphicon glyphicon-asterisk ">

      <h5>Pathfinding Visualizer using </h5>
      <h6>Dijkstra Algorithm</h6> 
       

      </nav>
        

        <button className="mt-5 mr-3  btn btn-outline-info" onClick={() => this.visualizeDijkstra()}>
          Visualize Dijkstra's Algorithm
        </button>
        <button className=" mt-5 mr-3 btn btn-outline-info" onClick={() => window.location.reload()}>
          Reset
        </button>
        <button className=" mt-5 btn btn-outline-info " onClick={() => this.createMaze()}>
          Create Random Maze
        </button>


        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {row, col, isFinish, isStart, isWall} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
        </React.Fragment>
    );
  }
}


const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 16; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};
const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

