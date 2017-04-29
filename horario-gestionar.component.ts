import { Component, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { DinamicService } from '../../../services/dinamic.service';
import { FuncionesGeneralesService } from '../../../services/funcionesGenerales.service';
import { horarioUsuario } from '../../../model/horarioUsuario';
import { Ruta } from "../../../services/mock.rutas";

declare var notificacion: any;
declare var $: any;

@Component({
  selector: 'horario-gestionar',
  templateUrl: './horario-gestionar.component.html',
  styleUrls: ['./horario-gestionar.component.css'],
  providers: [  LoginService,
                DinamicService,
                FuncionesGeneralesService]
})
export class HorarioGestionarComponent implements OnInit {
    private token:any;
    public Item: horarioUsuario;
    public itemList1: horarioUsuario;
    public DiaSemana:any[];
    public rutaAbsoluta = Ruta.abs;
    public errorMessage:any;
    public status:any;
    
    @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() tipo:string;
    @Input() titulo:string;
    @Input() entidad:string;
    
    @Input()
    set item(_item: any) {
//        console.log(_item);
        if(_item != undefined){
            //asigna los valores que vienen por input al item que se esta manipulando
            this.Item = _item;   
            
            if(_item.Horadesde != null && _item.Horadesde != undefined && Number.isInteger(_item.Horadesde)){
               this.Item.horaDesde = this._FuncionesGeneralesService.segundosATiempo(_item.Horadesde); 
            }
            if(_item.Horahasta != null && _item.Horahasta != undefined && Number.isInteger(_item.Horahasta)){
               this.Item.horaHasta = this._FuncionesGeneralesService.segundosATiempo(_item.Horahasta); 
            }
            this.Item.dia = _item.Dia;
        } 
    }
    
    constructor(
        private _loginService: LoginService,
        private _dinamicService: DinamicService,  
        private _FuncionesGeneralesService: FuncionesGeneralesService,      
        private elementRef:ElementRef,  
    ) { }

    ngOnInit() {
        this.DiaSemana = [  {'dia':1,'name':'Lunes'},
                            {'dia':2,'name':'Martes'},
                            {'dia':3,'name':'Miercoles'},
                            {'dia':4,'name':'Jueves'},
                            {'dia':5,'name':'Viernes'},
                            {'dia':6,'name':'Sabado'},
                            {'dia':7,'name':'Domingo'}];
//        console.log(this.Item);                    
        this.Item = new horarioUsuario(null,null,null);
        this.token = this._loginService.getToken();
        
    }
    
    ngAfterViewInit(){
        $('#tiempodesde' + this.tipo).timepicker({   'timeFormat': 'H:i:s', 
                                                    'step': 15 });
        $('#tiempohasta' + this.tipo).timepicker({   'timeFormat': 'H:i:s', 
        'step': 15 });
    }
    
    getHorario(){
        var settings = {
            "nombreEntidad": this.entidad,
                         };
        this._dinamicService.dinamicGetByEntity(this.token,settings,(response:any) => {
            this.itemList1 = response;
            
        });   
    }
    
    onSubmit(){
        switch (this.tipo){
            case "Agregar":
                if($('#tiempohasta' + this.tipo).val() > $('#tiempodesde' + this.tipo).val()){
                    this.onAgregarSubmit();
                }else{
                    notificacion("El tiempo de inicio tiene que ser inferior al tiempo de finalización");
                    $('#tiempodesde' + this.tipo).focus();
                }
            break;
            case "Modificar":
                if($('#tiempohasta' + this.tipo).val() > $('#tiempodesde' + this.tipo).val()){
                    this.onModificarSubmit();
                }else{
                    notificacion("El tiempo de inicio tiene que ser inferior al tiempo de finalización");
                    $('#tiempodesde' + this.tipo).focus();
                }         
            break;
        } 
    }
    
    onAgregarSubmit(){
        this.Item.dia = $("#dia2").val();
        
        var tiempodesde = this
                            .elementRef
                            .nativeElement
                            .querySelector("#tiempodesde"+this.tipo)
                            .value
        this.Item.horaDesde = this._FuncionesGeneralesService.tiempoASegundos(tiempodesde);
        
        var tiempohasta = this
                            .elementRef
                            .nativeElement
                            .querySelector("#tiempohasta"+this.tipo)
                            .value
 
        this.Item.horaHasta = this._FuncionesGeneralesService.tiempoASegundos(tiempohasta);
        
//        console.log(this.Item);
        var settings = {"nombreEntidad": this.entidad,
                        "datos": this.Item };
//                        console.log(settings);
        this
            ._dinamicService
            .dinamicCreate(settings,this.token)
            .subscribe(
                response => {    
                    if(!response.json())
                    {
//                        console.log(response);
                        return false;                    
                    }
                    else
                    {
                        let objectData=response.json();

                        if(objectData.code == 200)
                        {
                            this.notify.emit(true);
                            notificacion('Aviso','Registrado correctamente','success');                            
                            this.Item = new horarioUsuario(null,null,null);  
                            $('.modal').modal('hide');  
                        }
                        else
                        {
                            this.Item = new horarioUsuario(null,null,null);  
                            $('.modal').modal('hide'); 
                            notificacion('Aviso','Error en la petición','error');
//                            console.log(objectData);
                        }
                        
                    }
                },
                error => {
                    this.Item = new horarioUsuario(null,null,null);  
                    $('.modal').modal('hide'); 
//                    console.log(<any>error);
                    notificacion('Aviso','Error en la petición','error');
                }
            );   
    }
    
    onModificarSubmit(){
        this.Item.dia = this
                            .elementRef
                            .nativeElement
                            .querySelector("#dia2").value;
        
        var tiempodesde = this
                            .elementRef
                            .nativeElement
                            .querySelector("#tiempodesde"+this.tipo)
                            .value
        this.Item.horaDesde = this._FuncionesGeneralesService.tiempoASegundos(tiempodesde);
        
        var tiempohasta = this
                            .elementRef
                            .nativeElement
                            .querySelector("#tiempohasta"+this.tipo)
                            .value
 
        this.Item.horaHasta = this._FuncionesGeneralesService.tiempoASegundos(tiempohasta);
        
        var settings = {"nombreEntidad": this.entidad,
                        "datos": this.Item };
       
        this._dinamicService
            .dinamicUpdate(settings,this.token)
            .subscribe(
                response => {    
                    if(!response.json())
                    {
//                        console.log(response);
                        return false;                    
                    }
                    else
                    {
                        let objectData=response.json();

                        if(objectData.code == 200)
                        {
                            this.notify.emit(true);
                            notificacion('Aviso','Actualizado correctamente','success');
                            $('.modal').modal('hide');
                        }
                        else
                        {
                            notificacion('Aviso','Elemento no editado','error');
//                            console.log(objectData);
                        }
                    }
                },
                error => {
                    this.notify.emit(true);
//                    console.log(<any>error);
                    notificacion('Aviso','Error en la petición','error');
                }
            );
    }
  
}
