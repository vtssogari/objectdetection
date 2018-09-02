
export class SchemaObject {
    name: string;
    properties: Array<SchemaObject|SchemaArray|SchemaScala>;
    typeName: string = ''; 
    
    public toSchema():string {
        var props = '';
        if(this.typeName == ''){
            this.typeName = firstLetterCap(this.name);
        }
        if(this.properties){
            let propArray = this.properties.map(p => {
                if(p instanceof SchemaObject){
                    let o: SchemaObject = p as SchemaObject;
                    return `    ${o.name}: ${o.toSchemaType()}`;
                }else if(p instanceof SchemaScala){
                    let s: SchemaScala = p as SchemaScala;
                    return "    "+s.toSchema();
                }else if(p instanceof SchemaArray){
                    let a: SchemaArray = p as SchemaArray;
                    return "    "+a.toSchemaType();
                }else{
                    return '';
                }
            })
            props = propArray.join(",   ");
        }
        return`
type ${this.typeName} {
${props}
}
        `;
    }

    public toSchemaType():string{
        if(this.typeName == ''){
            this.typeName = firstLetterCap(this.name);
        }
        return `${this.typeName}`;
    }
}

export class SchemaArray {
    name: string;
    typeName: string;
    property: SchemaObject|SchemaScala;

    public toSchema():string {
       return "";
    }

    public toSchemaType():string{
        let typeString = '';
        if(this.property instanceof SchemaObject){
            let o = this.property as SchemaObject;
            typeString = o.toSchemaType();
        }else if(this.property instanceof SchemaScala){
            let s = this.property as SchemaScala;
            typeString = s.toSchemaType();
        }
        return `${this.name}: [${typeString}]`;
    }
}

export function firstLetterCap(value:string):string {
    return value.charAt(0).toUpperCase()+ value.substr(1);
}


export class SchemaScala {
    name: string;
    type: string;

    public toSchema():string {
        return `${this.name}: ${this.toSchemaType()}`;
     }

    public toSchemaType():string {
        //'string', 'number', 'array', 'object', 'boolean', 'integer'
        var graphqlType = 'String'; //String, Int, Float, Boolean, ID
        if(this.type == 'string'){
            graphqlType = 'String';
        }else if(this.type == 'number'){
            graphqlType = 'Float';
        }else if(this.type == 'boolean'){
            graphqlType = 'Boolean';
        }else if(this.type == 'integer'){
            graphqlType = 'Int';
        }
        return `${graphqlType}`;
    }
}