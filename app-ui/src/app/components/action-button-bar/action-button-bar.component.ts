import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {MessageQueueService} from '@tibco-tcstk/tc-core-lib';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {TButton} from '../../models_ui/buttons';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'action-button-bar',
    templateUrl: './action-button-bar.component.html',
    styleUrls: ['./action-button-bar.component.css']
})
export class ActionButtonBarComponent implements OnInit, OnChanges {

    @Input() buttons: TButton[];

    @Output() actionButtonClicked: EventEmitter<TButton> = new EventEmitter<TButton>();

    @ViewChild(MatMenuTrigger, {static: true}) trigger: MatMenuTrigger;
    // @ViewChild('appAdminMenu', {static: true}) adminTrigger: MatMenuTrigger;


    public primaryButtons: TButton[];
    public additionalButtons: TButton[];
    public adminButtons: TButton[];
    public showAdditionalButtons = false;
    public showAdminButtons = false;

    public maxButtons: number;
    private preferredButtons = [];
    private adminButtonNames = [];

    constructor(protected route: ActivatedRoute) {
        this.buttons = [];
        this.additionalButtons = [];
        this.adminButtons = [];
    }

    ngOnInit() {
        this.preferredButtons = [];
        this.adminButtonNames = [];
        this.maxButtons = 5;
        this.showAdminButtons = false;
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setButtons();
    }

    buttonClicked(event, button) {
        this.actionButtonClicked.emit(button);
    }

    openMenu() {
        this.trigger.openMenu();
    }

    setButtons() {
        if (this.buttons) {
            // Move all admin buttons to admin
            this.adminButtons = [];
            this.showAdminButtons = false;
            for (const admBut of this.adminButtonNames) {
                let i = this.buttons.length;
                while (i--) {
                    if (this.buttons[i]) {
                        if (this.buttons[i].label === admBut) {
                            this.adminButtons.push(this.buttons[i]);
                            this.buttons.splice(i, 1);
                        }
                    }
                }
            }
            if (this.adminButtons.length > 0) {
                this.showAdminButtons = true;
            }
            for (const but of this.buttons) {
                if (but.type === 'MULTIPLE') {
                    // but.addition = ' *';
                    // but.addition = '';
                }
                for (const special of this.preferredButtons) {
                    if (but.label === special) {
                        this.buttons = this.moveToStart(but, this.buttons);
                    }
                }
            }
            if (this.buttons.length > this.maxButtons) {
                this.primaryButtons = this.buttons.slice(0, this.maxButtons);
                this.additionalButtons = this.buttons.slice(this.maxButtons, this.buttons.length);
                this.showAdditionalButtons = true;
            } else {
                this.primaryButtons = this.buttons;
                this.showAdditionalButtons = false;
            }
        }
    }

    moveToStart(item, array) {
        if (array.indexOf(item) > 0) {
            const index = array.indexOf(item);
            array.splice(index, 1);
            array.unshift(item);
        }
        return array;
    }
}
