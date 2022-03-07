import _ from 'lodash';
import beautify from 'js-beautify';

interface IPlainObject {
  [key: string]: any;
}

export enum ModuleType {
  cjs,
  esm,
}

export enum PartType {
  import,
  export,
}

function isDateString(value: any): boolean {
  if (typeof value !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(value);
}

class Builder {
  private readonly __output: {
    fileRight: string;
    import: string;
    models: Array<IPlainObject>;
    module: ModuleType;
    format: beautify.JSBeautifyOptions;
  } = {
    fileRight: '',
    import: '',
    models: [],
    module: ModuleType.cjs,
    format: {
      indent_size: 4,
      space_in_empty_paren: true,
    },
  };

  constructor(module: ModuleType = ModuleType.cjs) {
    this.__output.module = module;
  }

  public makeFileRight(): Builder {
    const date = new Date();
    const year = date.getFullYear();
    const generatedDate = date.toLocaleString();
    this.__output.fileRight = `\n/**\n  * Copyright ${year} jsonmodel-js\n  * Auto-generated: ${generatedDate} \n  *\n  * @author jsonmodel-js\n  * @github https://github.com/wuxushun/jsonmodel-js\n  */`;
    return this;
  }

  public makeImport(): Builder {
    if (this.__output.module === ModuleType.cjs) {
      this.__output.import = `const JsonModel = require('jsonmodel-js/cjs');`;
    } else {
      this.__output.import = `import JsonModel from 'jsonmodel-js/esm';`;
    }
    return this;
  }

  public makeDeine(modelName: string, json: IPlainObject): Builder {
    if (_.isPlainObject(json)) {
      const models: Array<IPlainObject> = this.getModel(modelName, json, []);
      this.__output.models = models;
    }
    return this;
  }

  public format(options?: beautify.JSBeautifyOptions) {
    if (options) {
      this.__output.format = options;
    }
    return this;
  }

  public execute(): string {
    const result: Array<string> = [];
    if (this.__output.fileRight) {
      result.push(this.__output.fileRight);
    }
    if (this.__output.import) {
      result.push(this.__output.import);
    }
    if (Array(this.__output.models) && this.__output.models.length > 0) {
      this.__output.models.forEach((sub, index) => {
        const isMainModel = index === this.__output.models.length - 1;
        if (isMainModel) {
          result.push(sub.template);
        }
        if (!isMainModel) {
          if (this.__output.module === ModuleType.esm) {
            result.push(`export ${sub.template}`);
          } else {
            result.push(sub.template);
          }
        }
      });
    }

    const mainModel = _.last(this.__output.models);
    if (mainModel) {
      if (this.__output.module === ModuleType.cjs) {
        result.push(`module.exports = ${mainModel.modelName};`);
      } else if (this.__output.module === ModuleType.esm) {
        result.push(`export default ${mainModel.modelName};`);
      }
    }
    if (!mainModel) {
      if (this.__output.module === ModuleType.cjs) {
        result.push('module.exports = {};');
      } else if (this.__output.module === ModuleType.esm) {
        result.push('export default {};');
      }
    }
    const resultText = `${result.join(' \n\n ')}\n`;
    if (this.__output.format) {
      return beautify(resultText, this.__output.format);
    }
    return resultText;
  }

  private getValueType(value: any): string | null {
    if (isDateString(value)) {
      return 'DateString';
    }
    if (_.isString(value)) {
      return 'String';
    }
    if (_.isNumber(value)) {
      return 'Number';
    }
    if (_.isBoolean(value)) {
      return 'Boolean';
    }
    if (_.isPlainObject(value)) {
      return 'PlainObject';
    }
    if (_.isArray(value)) {
      return `Array-${this.getValueType(_.first(value))}`;
    }
    return null;
  }

  private getModel(
    modelName: string,
    json: IPlainObject,
    templates: Array<IPlainObject>
  ): Array<IPlainObject> {
    if (!_.isPlainObject(json)) return templates;
    const items: Array<string> = [];
    _.toPairs(json).forEach((data: any) => {
      const [key, value] = data;
      const valueType = this.getValueType(value);
      if (!valueType) {
        return;
      }
      if (valueType === 'PlainObject') {
        const subModelName = `${key}Model`;
        this.getModel(subModelName, value, templates);
        items.push(` ${key}: { type: ${subModelName} } `);
      } else if (_.startsWith(valueType, 'Array')) {
        const types = valueType.split('-');
        let type: string = _.last(types) || '';
        if (type === 'PlainObject') {
          type = `${key}Model`;
        }
        this.getModel(type, _.first(value) as any, templates);
        items.push(` ${key}: { type: [${type}] } `);
      } else {
        items.push(` ${key}: { type: '${valueType}' } `);
      }
    });
    const template = items.join(',');
    templates.push({
      modelName,
      template: `const ${modelName} = new JsonModel.define({ ${template} });`,
    });
    return templates;
  }
}

export default Builder;
