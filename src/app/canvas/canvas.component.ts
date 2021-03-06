import {
  AfterViewInit, ApplicationRef, Component, ComponentFactoryResolver, EmbeddedViewRef, Injector, NgModule,
  OnInit
} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {InputBoxComponent} from '../input-box/input-box.component';
import {InputCircleComponent} from '../input-circle/input-circle.component';
import {Globals} from '../globals';
import swal from 'sweetalert2';
import {v4 as uuid} from 'uuid';
import {LineComponent} from '../line/line.component';
import {AuthService} from '../services/auth.service';
import {FlashMessagesService} from 'angular2-flash-messages';
import {Router} from '@angular/router';
import {NavbarComponent} from '../navbar/navbar.component';

@NgModule({
  imports: [NgbModule]
})

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})

export class CanvasComponent implements OnInit, AfterViewInit {
  compList: any[] = this.globals.compList;
  connectors = this.globals.connectors;
  userId: string;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private appRef: ApplicationRef,
              private injector: Injector,
              private globals: Globals,
              private authService: AuthService,
              private flashMessage: FlashMessagesService,
              private router: Router) {
  }

  ngOnInit() {
    document.getElementById('workspace').scrollTo(0, 178);

    this.authService.getProfile().subscribe(profile => {
        this.userId = profile.user._id;
      },
      err => {
        return false;
      });

  }

  ngAfterViewInit() {
    if (this.compList.length > 0) {
      const compNum = this.compList.length;
      for (let i = 0; i < compNum; i++) {
        this.enterToDom(this.compList[i]);
      }
    }
    if (this.connectors.length > 0) {
      const myTO = setInterval(function () {
        let error = false;

        const conNum = this.connectors.length;
        for (let i = 0; i < conNum; i++) {
          const conn = this.connectors[i];
          try {
            this.drawLine(conn.node1, conn.node2, false, conn.id);
          } catch (e) {
            error = true;
          } finally {
            if (!error) {
              clearInterval(myTO);
            }
          }
        }
      }.bind(this), 100);

    }
  }


  enterToDom(comp) {
    const id = comp.id;
    switch (comp.type) {
      case 'Box': {
        const componentRef = this.componentFactoryResolver.resolveComponentFactory(InputBoxComponent).create(this.injector);
        componentRef.instance.cid = id;
        componentRef.instance.showcntrl = 'showControls' + id;
        componentRef.instance.cntrl = 'controls' + id;
        componentRef.instance.title = comp.title;
        componentRef.instance.body = comp.body;

        this.appRef.attachView(componentRef.hostView);
        const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        this.insertComponent(domElem, comp.x, comp.y);
        break;
      }
      case 'Circle': {
        const componentRef = this.componentFactoryResolver.resolveComponentFactory(InputCircleComponent).create(this.injector);
        componentRef.instance.cid = id;
        componentRef.instance.showcntrl = 'showControls' + id;
        componentRef.instance.cntrl = 'controls' + id;
        componentRef.instance.title = comp.title;
        componentRef.instance.body = comp.body;

        this.appRef.attachView(componentRef.hostView);
        const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        this.insertComponent(domElem, comp.x, comp.y);
        break;
      }
    }
  }

  /**
   * @desc insert components to the canvas
   * @param domElem - type of component to be inserted
   * @param x - x coordinate of position
   * @param y - y coordinate of position
   */
  insertComponent(domElem, x, y) {
    domElem.style.position = 'absolute';
    const scroll = this.getScroll();
    const workspaceX = document.getElementById('workspace').getBoundingClientRect().left;
    const workspaceY = document.getElementById('workspace').getBoundingClientRect().top;
    const xPos = x + scroll[0] - workspaceX - 41;
    const yPos = y + scroll[1] - workspaceY - 105;
    domElem.style.left = xPos + 'px';
    domElem.style.top = yPos + 'px';
    const canvas = document.getElementById('canvas');
    canvas.appendChild(domElem);
  }

  /**
   * @desc prevent default drops
   * @param ev - drop event
   */
  allowDrop(ev) {
    ev.preventDefault();
  }

  /**
   * @desc setting data of drag event
   * @param ev
   */
  drag(ev) {
    ev.dataTransfer.setData('text', ev.target.id);

  }

  /**
   * @desc sense drop of toolbox elements & call function to insert component
   * @param ev
   */
  drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData('text');
    const id = uuid();
    switch (data) {
      case 'boxModal': {
        const componentRef = this.componentFactoryResolver.resolveComponentFactory(InputBoxComponent).create(this.injector);
        componentRef.instance.cid = id;
        componentRef.instance.showcntrl = 'showControls' + id;
        componentRef.instance.cntrl = 'controls' + id;
        this.appRef.attachView(componentRef.hostView);
        const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        this.insertComponent(domElem, ev.screenX, ev.screenY);
        break;
      }
      case 'circleModal': {
        const componentRef = this.componentFactoryResolver.resolveComponentFactory(InputCircleComponent).create(this.injector);
        componentRef.instance.cid = id;
        componentRef.instance.showcntrl = 'showControls' + id;
        componentRef.instance.cntrl = 'controls' + id;
        this.appRef.attachView(componentRef.hostView);
        const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        this.insertComponent(domElem, ev.screenX, ev.screenY);
        break;
      }
    }

  }

  /**
   * confirm delete of components and update list
   * @param element - element to be deleted
   */
  delete(element) {
    swal({
      title: 'Are you sure?',
      type: 'info',
      showCancelButton: true,
      confirmButtonColor: '#1c0b6e',
      cancelButtonColor: '#3c3c3c',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {
        document.getElementById(element).remove();
        const component = this.compList.find(i => i.id === element);
        const index = this.compList.indexOf(component);
        this.compList.splice(index, 1);
      }
    });
  }

  /**
   * @desc update compoent array details
   */
  updateList() {
    this.globals.yScroll = (document.getElementById('workspace').scrollTop);
    this.globals.xScroll = (document.getElementById('workspace').scrollLeft);
    console.log(this.globals.xScroll, this.globals.yScroll);
    for (const comp of this.compList) {
      if (document.getElementById(comp.id)) {
        const component = document.getElementById(comp.id);
        if (comp.type === 'Circle') {
          comp.x = component.getBoundingClientRect().left + this.globals.xScroll + 40;
          comp.y = component.getBoundingClientRect().top + 65 + this.globals.yScroll - 179 + 40;
        } else {
          comp.x = component.getBoundingClientRect().left + this.globals.xScroll;
          comp.y = component.getBoundingClientRect().top + 65 + this.globals.yScroll - 179;
        }
        comp.height = component.getBoundingClientRect().height;
        comp.width = component.getBoundingClientRect().width;
        comp.z = component.style.zIndex;
      }
    }
  }

  /**
   * @desc get amount of scroll of the workspace and returns scroll amount [x,y]
   * @returns {number[]}
   */
  getScroll() {
    const elmnt = document.getElementById('workspace');
    const x = elmnt.scrollLeft;
    const y = elmnt.scrollTop;
    return [x, y];
  }

  /**
   * @desc drawing line & updating lists
   * @param prevNode
   * @param curNode
   * @param newConnection
   * @param id
   */
  drawLine(prevNode, curNode, newConnection, id) {
    let leftNode: string;
    let rightNode: string;
    const lineId = id;
    if (curNode !== prevNode) {
      // setting left and right nodes
      if (document.getElementById(prevNode).getBoundingClientRect().left < document.getElementById(curNode).getBoundingClientRect().left) {
        leftNode = prevNode;
        rightNode = curNode;
      } else {
        leftNode = curNode;
        rightNode = prevNode;
      }

      // generating line
      const componentRef = this.componentFactoryResolver.resolveComponentFactory(LineComponent).create(this.injector);
      /*const lineId = componentRef.instance.cid;*/
      componentRef.instance.cid = lineId;
      this.appRef.attachView(componentRef.hostView);
      const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

      const leftNodeElm = this.compList.find(i => i.id === leftNode);
      const rightNodeElm = this.compList.find(i => i.id === rightNode);
      const lineLeftX = leftNodeElm.x + (leftNodeElm.width / 2);
      const lineLeftY = /*leftNodeElm.y + leftNodeElm.height; */document.getElementById(leftNode).getBoundingClientRect().bottom - leftNodeElm.height / 2;
      const lineRightX = rightNodeElm.x + (rightNodeElm.width / 2);
      const lineRightY = /*rightNodeElm.y + rightNodeElm.height; */document.getElementById(rightNode).getBoundingClientRect().bottom - rightNodeElm.height / 2;

      // calculating line length and angle
      const xDist = lineRightX - lineLeftX;
      const yDist = lineRightY - lineLeftY;
      const hypo = Math.sqrt((Math.pow(xDist, 2) + Math.pow(yDist, 2)));
      const angleRad = Math.atan(yDist / xDist);
      const angleDeg = angleRad * 180 / Math.PI;

      domElem.style.position = 'absolute';
      const adjustment = angleDeg * 3;

      // setting line left position
      const scroll = this.getScroll();
      const workspaceX = document.getElementById('workspace').getBoundingClientRect().left;
      const workspaceY = document.getElementById('workspace').getBoundingClientRect().top;
      domElem.style.left = lineLeftX + scroll[0] - workspaceX - Math.abs(adjustment) + 'px';
      domElem.style.top = lineLeftY + scroll[1] - workspaceY + adjustment + 'px';

      // adding to canvas, set width and transformation
      const canvas = document.getElementById('canvas');
      canvas.appendChild(domElem);
      setTimeout(function () {
        if (document.getElementById(lineId)) {
          const newLine = document.getElementById(lineId);
          newLine.style.width = hypo + 'px';
          newLine.style.transform = 'rotate(' + angleDeg + 'deg)';
        }
      }, 10);

      // adding connector to components in the list
      const leftEle = this.compList.find(i => i.id === leftNode);
      const rightEle = this.compList.find(i => i.id === rightNode);

      if (newConnection) {
        leftEle.connectors.push(lineId);
        rightEle.connectors.push(lineId);
        leftEle.neighbors.push(rightNode);
        rightEle.neighbors.push(leftNode);
        const line = {id: lineId, node1: leftNode, node2: rightNode};
        this.connectors.push(line);
      }
    }
  }

  /**
   * save workflow
   * @returns {Promise<void>}
   */
  async save() {
    if (this.authService.loggedIn()) {
      const workflowName = (this.globals.workflowName === undefined) ? 'untitled workflow' : this.globals.workflowName;

      const {value: name} = await swal({
        title: 'Enter workflow name',
        input: 'text',
        inputPlaceholder: 'Enter workflow name',
        inputValue: workflowName,
        showCancelButton: true,
        inputValidator: (value) => {
          return !value && 'Please enter a name to save workflow!';
        }
      });

      if (name) {
        this.globals.workflowName = name;
        NavbarComponent.workflowName = name;
        swal({type: 'success', title: 'Done'});
      }

      const workflow = {
        name: this.globals.workflowName,
        compArray: this.compList,
        connArray: this.connectors,
        user_id: this.userId,
        savedDate: new Date().toISOString().split('T')[0]
      };


      this.authService.checkWorkflow(workflow.user_id, workflow.name).subscribe(data => {
        console.log('check : ' + data.success);
        if (data.success) {
          this.authService.saveWorkflow(workflow).subscribe(dat => {
            if (dat.success) {
              this.flashMessage.show('Workflow saved', {cssClass: 'alert-success', timeout: 3000});
            } else {
              this.flashMessage.show('Something went wrong', {cssClass: 'alert-danger', timeout: 3000});
            }
          });
        } else {
          swal({
            title: 'Workflow name ' + workflow.name + ' already exists',
            text: 'Please retry with a different name',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Retry'
          }).then((result) => {
            if (result.value) {
              this.save();
            }
          });
        }
      });

    } else {
      this.flashMessage.show('Login to save workflow', {
        cssClass: 'alert-danger', timeout: 3000
      });
      this.router.navigate(['/login']);
    }
  }

  /**
   * load a blank workspace
   */
  newWorkspace() {
    swal({
      title: 'New blank workspace?',
      text: 'All unsaved changess will be lost!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm'
    }).then((result) => {

      this.globals.workflowName = '';
      this.globals.connectors = [];
      this.globals.compList = [];
      swal({
        title: 'Loading!',
        text: 'Please wait',
        timer: 1000,
        onOpen: () => {
          swal.showLoading();
        }
      }).then((res) => {
        if (
          // Read more about handling dismissals
        res.dismiss === swal.DismissReason.timer
        ) {
          this.router.navigate(['/profile']).then((reslt) => {
            NavbarComponent.workflowName = 'untitled workflow';
            this.router.navigate(['/']);
          });
        }
      });

    });
  }
}

