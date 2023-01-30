import { select, templates, classNames } from '../settings.js';
import app from '../app.js';

class Finder {
  constructor(element) {
    const thisFinder = this;
    // save reference to finder page div
    thisFinder.element = element;
    // start at step 1
    thisFinder.step = 1;
    // render view for the first time
    thisFinder.getElements();
    thisFinder.render();
  }

  render() {
    const thisFinder = this;
    // determine what title and button content should be used
    let pageData = null;
    switch (thisFinder.step) {
      case 1:
        pageData = { title: 'DRAW ROUTES', buttonText: 'FINISH DRAWING' };
        break;
      case 2:
        pageData = { title: 'PICK START POINT', buttonText: 'PICK FINISH POINT' };
        break;
      case 3:
        pageData = { title: 'PICK FINISH POINT', buttonText: 'COMPUTE' };
        break;
      case 4:
        pageData = { title: 'THE BEST ROUTE IS...', buttonText: 'START AGAIN' };
        break;
    }
    // generate view from the template and set it as page content
    const generatedHTML = templates.finderPage(pageData);
    thisFinder.element.innerHTML = generatedHTML;
    // generate grid
    thisFinder.renderGrid();
  }

  renderGrid() {
    const thisFinder = this;
    // generate empty grid
    let html = '';
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        let id = parseInt(i.toString() + j.toString());
        html += '<div class="field" id="' + id + '"></div>';
      }
    }
    thisFinder.element.querySelector(select.containerOf.grid).innerHTML = html;
    // add class selected for path fields
    thisFinder.fieldsSelected.forEach((item) => {
      document.getElementById(item).classList.add(classNames.fieldSelected);
    });
    // show start point
    if (thisFinder.startField != null) {
      document
        .getElementById(thisFinder.startField)
        .classList.add(classNames.icons.type, classNames.icons.start, classNames.point);
    }
    // show finish point
    if (thisFinder.finishField != null) {
      document
        .getElementById(thisFinder.finishField)
        .classList.add(classNames.icons.type, classNames.icons.finish, classNames.point);
    }
    thisFinder.initActions();
  }

  changeStep(newStep) {
    //determine step of path finding
    const thisFinder = this;
    thisFinder.step = newStep;
    thisFinder.render();
  }

  initActions() {
    //determine callbacks for submi button and grid
    const thisFinder = this;
    if (thisFinder.step === 1) {
      thisFinder.element.querySelector(select.finder.submitBtn).addEventListener('click', function (event) {
        event.preventDefault();
        if (thisFinder.fieldsSelected.length >= 2) {
          thisFinder.changeStep(2);
        } else {
          thisFinder.showAlert('pick at least 2 fields', 1);
        }
      });
      thisFinder.element.querySelector(select.containerOf.grid).addEventListener('click', function (event) {
        event.preventDefault();
        thisFinder.addToPath(event);
      });
    } else if (thisFinder.step === 2) {
      thisFinder.element.querySelector(select.finder.submitBtn).addEventListener('click', function (event) {
        event.preventDefault();
        if (thisFinder.startField != null) {
          thisFinder.changeStep(3);
        } else {
          thisFinder.showAlert('pick start field', 1);
        }
      });
      thisFinder.element.querySelector(select.containerOf.grid).addEventListener('click', function (event) {
        event.preventDefault();
        thisFinder.pickRoutePoint(event, 'startField', 'finishField', classNames.icons.start);
      });
    } else if (thisFinder.step === 3) {
      thisFinder.element.querySelector(select.finder.submitBtn).addEventListener('click', function (event) {
        event.preventDefault();
        if (thisFinder.finishField != null) {
          thisFinder.changeStep(4);
          thisFinder.findNodes(thisFinder.startField, thisFinder.finishField);
          thisFinder.findShortestPath(thisFinder.startField, thisFinder.finishField);
        } else {
          thisFinder.showAlert('pick finish field', 1);
        }
      });
      thisFinder.element.querySelector(select.containerOf.grid).addEventListener('click', function (event) {
        event.preventDefault();
        thisFinder.pickRoutePoint(event, 'finishField', 'startField', classNames.icons.finish);
      });
    } else if (thisFinder.step === 4) {
      thisFinder.element.querySelector(select.finder.submitBtn).addEventListener('click', function (event) {
        event.preventDefault();
        thisFinder.changeStep(1);
        thisFinder.getElements();
        thisFinder.render();
      });
    }
  }

  pickRoutePoint(event, firstPoint, secondPoint, iconClass) {
    const thisFinder = this;
    const thisField = event.target;
    if (thisField.classList.contains(classNames.field)) {
      //get field id
      const field = Number(thisField.getAttribute('id'));
      //check if field has been picked in route field
      if (thisFinder.fieldsSelected.includes(field)) {
        //check if field is not start or finish point
        if (thisFinder[secondPoint] != field) {
          //check if field is not already selected as start/finish point
          if (thisFinder[firstPoint] != field) {
            //remove old start/finish point
            if (thisFinder[firstPoint] != null) {
              const firstPointElement = document.getElementById(thisFinder[firstPoint]);
              setTimeout(firstPointElement.classList.remove(classNames.icons.type, iconClass), 1000);
              firstPointElement.classList.remove(classNames.point);
            }
            //set new start/finish point
            thisField.classList.add(classNames.icons.type, iconClass, classNames.point);
            thisFinder[firstPoint] = field;
          } else {
            //remove present start/finish point
            setTimeout(thisField.classList.remove(classNames.icons.type, iconClass), 1000);
            thisField.classList.remove(classNames.point);
            thisFinder[firstPoint] = null;
          }
        } else {
          thisFinder.showAlert('you can t set finish at start field', 1);
        }
      } else {
        thisFinder.showAlert('you can only pick point on selected fields', 1);
      }
    }
  }

  addToPath(event) {
    const thisFinder = this;
    const thisField = event.target;
    //get field id
    const field = Number(thisField.getAttribute('id'));
    if (thisField.classList.contains(classNames.field)) {
      if (!thisFinder.fieldsSelected.includes(field)) {
        //check if array exists and is not empty (statement for first route field)
        if (thisFinder.fieldsSelected.length) {
          //determine adjoining fields ids
          const edgeFields = thisFinder.getEdgeFields(field);
          //check if field touch any routes field
          let fieldAdj = false;
          edgeFields.every((item) => {
            if (thisFinder.fieldsSelected.includes(item)) {
              fieldAdj = true;
              return false;
            }
            return true;
          });
          //if field doesn't touch any routes fields show alert
          if (!fieldAdj) {
            thisFinder.showAlert('a new field should touch at least one that is already selected', 1);
            return;
          }
        }
        //add field to routes fields
        thisField.classList.add(classNames.fieldSelected);
        thisFinder.fieldsSelected.push(Number(thisField.getAttribute('id')));
      } else {
        let adjFieldsSelected = 0;
        let adjFieldsVisited = 0;
        thisFinder.fieldsSelected.splice(thisFinder.fieldsSelected.indexOf(Number(thisField.getAttribute('id'))), 1);
        thisFinder.fieldsVisited = [];
        //check connectivity between routes fields (determine visited fields)
        thisFinder.findNodes(thisFinder.fieldsSelected[0]);
        const edgeFields = thisFinder.getEdgeFields(field);
        edgeFields.forEach((item) => {
          if (thisFinder.fieldsSelected.includes(item)) {
            adjFieldsSelected++;
            if (thisFinder.fieldsVisited.includes(item)) {
              adjFieldsVisited++;
            }
          }
        });
        //if not all edge fields, which are route fields were visited (lack of connectivity between selected fields)
        if (adjFieldsVisited != adjFieldsSelected) {
          //push back field to route fields and show alert
          thisFinder.fieldsSelected.push(Number(thisField.getAttribute('id')));
          thisFinder.showAlert('you can t cancel selection of this field', 1);
          return;
        }
        //remove class route field
        thisField.classList.remove(classNames.fieldSelected);
      }
    }
  }

  getElements() {
    const thisFinder = this;
    thisFinder.fieldsSelected = [];
    thisFinder.startField = null;
    thisFinder.finishField = null;
  }

  findNodes(start) {
    const thisFinder = this;
    //create array of visited fields (analyzed fields)
    thisFinder.fieldsVisited = [];
    //create collection of grid nodes(routes junctions) and add start field
    thisFinder.nodes = {};
    thisFinder.nodes[start] = {};
    thisFinder.nodes[start].prev = [];
    thisFinder.nodes[start].edgeFields = [];
    thisFinder.fieldsVisited.push(start);
    //create array of start point adjoining fields
    const edgeFields = thisFinder.getEdgeFields(start);
    //find edge fields that are route fields and add them to adjoining fields collection for start node
    for (let field of edgeFields) {
      if (thisFinder.fieldsSelected.includes(field)) {
        thisFinder.nodes[start].edgeFields.push(field);
      }
    }
    //create nodes array
    let nodes = [start];
    //search for grid nodes (routes junctions)
    while (!nodes.length == 0) {
      let currNode = nodes[0];
      //for each field from adjoining fields
      for (let field of thisFinder.nodes[currNode].edgeFields) {
        //currently analyzed adjoining field
        let currField = field;
        let prevField = currNode;
        let prevPathLength = 0;
        let pathLength = 1;
        let currFieldEdgeFields = [];
        //collection of current path fields
        let path = [];
        path.push(currNode);
        while (prevPathLength < pathLength) {
          prevPathLength = pathLength;
          //add field to currently analyzed path
          path.push(currField);
          thisFinder.fieldsVisited.push(currField);
          //find edge fields of currently analyzed field
          const edgeFields = thisFinder.getEdgeFields(currField);
          //remove previous field from edge fields to analyze
          if (edgeFields.includes(prevField)) {
            edgeFields.splice(edgeFields.indexOf(prevField), 1);
          }
          //find edge fields that are route fields and add them to adjoining fields array for currently analyzed field
          for (let field of edgeFields) {
            if (thisFinder.fieldsSelected.includes(field)) {
              currFieldEdgeFields.push(field);
            }
          }
          //if only one field joins currently analyzed field -> extend length of current path
          if (currFieldEdgeFields.length == 1 && currField != currNode && currField != thisFinder.finishField) {
            pathLength++;
            prevField = currField;
            //next field to analyze
            currField = currFieldEdgeFields[0];
            currFieldEdgeFields = [];
          } else if (currFieldEdgeFields.length > 1 || currField == thisFinder.finishField) {
            //add new node params to collection and path to it from currently analyzed node
            if (!thisFinder.nodes[currField]) {
              thisFinder.nodes[currField] = {};
              thisFinder.nodes[currField].nodes = {};
              if (!thisFinder.nodes[currNode].nodes) {
                thisFinder.nodes[currNode].nodes = {};
              }
              thisFinder.addNodePathParams(currNode, currField, path, pathLength);
              thisFinder.addNodePathParams(currField, currNode, path, pathLength);
              //create array of edge fields for new node
              thisFinder.nodes[currField].edgeFields = [];
              currFieldEdgeFields.forEach(function (item) {
                thisFinder.nodes[currField].edgeFields.push(item);
              });
              currFieldEdgeFields = [];
              nodes.push(currField);
            } else if (currField != currNode) {
              currFieldEdgeFields = [];
              if (!thisFinder.nodes[currNode].nodes[currField]) {
                thisFinder.addNodePathParams(currNode, currField, path, pathLength);
              }
              if (!thisFinder.nodes[currField].nodes[currNode]) {
                thisFinder.addNodePathParams(currField, currNode, path, pathLength);
              }
              //if new path between current node and current field is shorter than previous -> save new params
              if (thisFinder.nodes[currNode].nodes[currField].length > pathLength) {
                thisFinder.addNodePathParams(currNode, currField, path, pathLength);
                thisFinder.addNodePathParams(currField, currNode, path, pathLength);
              }
              //remove previously analyzed field from currently analyzed node edge fields collection to not analyze path through it again
              if (thisFinder.nodes[currField].edgeFields.includes(prevField)) {
                thisFinder.nodes[currField].edgeFields.splice(
                  thisFinder.nodes[currField].edgeFields.indexOf(prevField),
                  1
                );
              }
            }
          } else if (currField == currNode) {
            //(loop) create node for previously analyzed field
            if (!thisFinder.nodes[prevField]) {
              thisFinder.nodes[prevField] = {};
              thisFinder.nodes[prevField].nodes = {};
            }
            if (!thisFinder.nodes[currNode].nodes) {
              thisFinder.nodes[currNode].nodes = {};
            }
            thisFinder.addNodePathParams(currNode, prevField, path, pathLength);
            thisFinder.addNodePathParams(prevField, currNode, path, pathLength);
            //remove previously analyzed field from currently analyzed node edge fields collection
            if (thisFinder.nodes[currNode].edgeFields.includes(prevField)) {
              thisFinder.nodes[currNode].edgeFields.splice(thisFinder.nodes[currNode].edgeFields.indexOf(prevField), 1);
            }
          } else {
            //add dead end
            thisFinder.nodes[currField] = {};
            if (!thisFinder.nodes[currNode].nodes) {
              thisFinder.nodes[currNode].nodes = {};
            }
            thisFinder.addNodePathParams(currNode, currField, path, pathLength);
          }
        }
      }
      //remove first element from nodes array
      nodes.shift();
    }
    console.log(thisFinder.nodes);
    console.log(thisFinder.fieldsVisited);
  }

  addNodePathParams(firstNode, secondNode, pathFields, pathLength) {
    const thisFinder = this;
    thisFinder.nodes[firstNode].nodes[secondNode] = {};
    thisFinder.nodes[firstNode].nodes[secondNode].path = [];
    thisFinder.nodes[firstNode].nodes[secondNode].length = pathLength;
    thisFinder.nodes[firstNode].nodes[secondNode].path.push(...pathFields.reverse());
  }

  getEdgeFields(field) {
    let array = [];
    if (field % 10 > 0) array.push(field - 1); //get field on the left value
    if (field % 10 < 9) array.push(field + 1); //get field on the right value
    if (Math.floor(field / 10) > 0) array.push(field - 10); //get field on the top value
    if (Math.floor(field / 10) < 9) array.push(field + 10); //get field on the bottom value
    return array;
  }

  findMinimum(n, array) {
    let min = -1;
    let minDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < n; i++) {
      if (!array[i].visited && array[i].distance < minDist) {
        min = i;
        minDist = array[i].distance;
      }
    }
    return min;
  }

  Dijkstra(matrix, n, start) {
    const thisFinder = this;
    //create collection of graph nodes and fill with initial values
    let array = [];
    for (let i = 0; i < n; i++) {
      array.push({});
      array[i].distance = i == start ? 0 : Number.POSITIVE_INFINITY;
      array[i].visited = false;
      array[i].previous = -1;
    }
    //find start field
    let u = thisFinder.findMinimum(n, array);
    //find shortest path to all graph nodes
    while (u != -1) {
      array[u].visited = true;
      for (let i = 0; i < n; i++) {
        if (matrix[u][i] > 0 && array[u].distance + matrix[u][i] < array[i].distance) {
          array[i].distance = array[u].distance + matrix[u][i];
          array[i].previous = u;
        }
      }
      u = thisFinder.findMinimum(n, array);
    }
    return array;
  }

  async findShortestPath(start, finish) {
    const thisFinder = this;
    //define qubic matrix size equal to nodes number
    const matrixSize = Object.keys(thisFinder.nodes).length;
    //create zero matrix
    let matrix = [];
    for (let i = 0; i < matrixSize; i++) {
      matrix[i] = [];
      for (let j = 0; j < matrixSize; j++) {
        matrix[i].push(0);
      }
    }
    //create array to get node index in nodes collection
    let idArray = [];
    for (let i = 0; i < matrixSize; i++) {
      idArray.push(Object.keys(thisFinder.nodes)[i]);
    }
    //fill matrix with path lengths between nodes
    for (let node in thisFinder.nodes) {
      let i = idArray.indexOf(node);
      for (let item in thisFinder.nodes[node].nodes) {
        let j = idArray.indexOf(item);
        if (i != j) {
          matrix[i][j] = thisFinder.nodes[node].nodes[item].length;
          matrix[j][i] = thisFinder.nodes[node].nodes[item].length;
        }
      }
    }
    let startId = Object.keys(thisFinder.nodes).indexOf(start.toString());
    //find paths from given field to all grid nodes
    let allPaths = thisFinder.Dijkstra(matrix, matrixSize, startId);
    //start from finish point
    let currNodeId = Object.keys(thisFinder.nodes).indexOf(finish.toString());
    let pathFields = [];
    //while current node is not equal to start field -> add path field to array and set new current node
    while (currNodeId != startId) {
      pathFields.push(...thisFinder.nodes[idArray[allPaths[currNodeId].previous]].nodes[idArray[currNodeId]].path);
      currNodeId = allPaths[currNodeId].previous;
    }
    //get array of unique path fields
    let uniqueFields = [...new Set(pathFields.reverse())];
    uniqueFields.splice(uniqueFields.indexOf(thisFinder.startField), 1);
    uniqueFields.splice(uniqueFields.indexOf(thisFinder.finishField), 1);
    await thisFinder.showShortestPath(uniqueFields);
    //generate info modal
    await app.timer(500);
    thisFinder.showAlert('the shortest route: ' + (uniqueFields.length + 2) + ' fields', 2);
  }

  async showShortestPath(array) {
    for (let item of array) {
      let thisSquare = document.getElementById(item);
      thisSquare.classList.add(classNames.path, classNames.icons.type, classNames.icons.dot);
      await app.timer(100);
    }
  }

  async showAlert(description, type) {
    app.enableFade = false;
    let info = null;
    switch (type) {
      case 1:
        info = { alertIcon: 'fa-circle-exclamation', text: description };
        break;
      case 2:
        info = { alertIcon: 'fa-circle-info', text: description };
        break;
    }
    //generate alert modal view
    const generatedHTML = templates.alert(info);
    const alertContainer = document.getElementById(select.containerOf.alert);
    alertContainer.innerHTML = generatedHTML;
    //show modal
    alertContainer.classList.add(classNames.alert.active);
    await app.timer(50);
    alertContainer.querySelector(select.alert.innerWrapper).classList.remove(classNames.alert.hide);
    alertContainer.querySelector(select.alert.innerWrapper).classList.add(classNames.alert.show);
    //add event listener for alert modal close button
    alertContainer.querySelector(select.alert.closeBtn).addEventListener('click', async function (event) {
      event.preventDefault();
      alertContainer.querySelector(select.alert.innerWrapper).classList.add(classNames.alert.hide);
      await app.timer(2800);
      alertContainer.querySelector(select.alert.innerWrapper).classList.remove(classNames.alert.show);
      alertContainer.classList.remove(classNames.alert.active);
      app.enableFade = true;
    });
  }
}

export default Finder;
