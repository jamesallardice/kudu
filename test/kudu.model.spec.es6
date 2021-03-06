import chai from 'chai';
import Model from '../src/modeller/model';
import BaseModel from '../src/modeller/base';

let expect = chai.expect;
let BasicModel;
let EmptyModel;
let InheritedModel;
let UnrequestableModel;
let InheritedUnrequestableModel;

beforeEach(() => {

  EmptyModel = new Model('empty', {
    properties: {},
  });

  BasicModel = new Model('basic', {
    title: 'Test',
    properties: {
      id: {
        type: Number,
        required: true,
      },
      hidden: {
        type: Number,
        public: false,
      },
      defaults: {
        type: String,
        default: 'default',
      },
    },
  });
  BasicModel.prototype.someMethod = () => 1;

  InheritedModel = new Model('inherited', BasicModel, {
    properties: {
      additional: {
        type: String,
        required: true,
      },
    },
  });
  InheritedModel.prototype.anotherMethod = () => 2;

  UnrequestableModel = new Model('unrequestable', {
    properties: {},
    requestable: false,
  });

  InheritedUnrequestableModel = new Model(UnrequestableModel, {
    properties: {},
  });
});

describe('Kudu.Model', () => {

  it('should throw an error if not passed a schema object', () => {
    function test() {
      return new Model();
    }
    expect(test).to.throw(Error, /schema/);
  });

  it('should return a constructor function', () => {
    expect(BasicModel).to.be.a('function');
  });

  describe('Constructor functions', () => {

    it('should throw an error if not passed instance data', () => {
      function test() {
        return new BasicModel();
      }
      expect(test).to.throw(Error, /instance data/);
    });
  });

  describe('Constructor instances', () => {

    it('should be instantiable', () => {
      expect(new EmptyModel({})).to.be.an.instanceOf(EmptyModel);
    });

    it('should inherit from the base model', () => {
      expect(new EmptyModel({})).to.be.an.instanceof(BaseModel);
    });

    it('should validate instance data against the schema', () => {
      function test() {
        return new BasicModel({});
      }
      expect(test).to.throw(Error, /is required/);
    });

    it('should receive default values for missing properties', () => {
      expect(new BasicModel({ id: 1 })).to.have.property('defaults', 'default');
    });

    it('should receive a type when one is not provided', () => {
      expect(new BasicModel({ id: 2 })).to.have.property('type', 'basic');
    });

    it('should throw an error when the wrong type is provided', () => {
      let test = () => new BasicModel({ id: 3, type: 'wrong' });
      expect(test).to.throw(Error, /mismatch/);
    });

    it('should not use default values when property is present', () => {
      expect(new BasicModel({
        id: 1,
        defaults: 'present',
      })).to.have.property('defaults', 'present');
    });

    it('should have a requestable property when set to false', () => {
      expect(UnrequestableModel.schema).to.have.property('requestable', false);
    });
  });

  describe('Extended instances', () => {

    it('should inherit properties from the parent model', () => {
      expect(new InheritedModel({
        id: 1,
        additional: '1',
      })).to.have.property('id', 1);
    });

    it('should obey the schema for inherited properties', () => {
      let test = () => new InheritedModel({ additional: '1' });
      expect(test).to.throw(Error, /is required/);
    });

    it('should obey the schema for own properties', () => {
      let test = () => new InheritedModel({ id: 1 });
      expect(test).to.throw(Error, /is required/);
    });

    it('should have access to its own methods', () => {
      let instance = new InheritedModel({ id: 1, additional: '1' });
      expect(instance).to.have.deep.property('anotherMethod');
    });

    it('should have access to methods from the parent', () => {
      let instance = new InheritedModel({ id: 1, additional: '1' });
      expect(instance).to.have.deep.property('someMethod');
    });

    it('should be requestable if not explictly set as not', () => {
      expect(InheritedUnrequestableModel.schema)
      .not.to.have.deep.property('requestable');
    });
  });

  describe('Base methods', () => {

    let instance;

    beforeEach(() => {
      instance = new BasicModel({
        id: 1,
        hidden: 2,
      });
    });

    describe('#toJSON', () => {

      it('should strip private properties from the instance by default', () => {
        let obj = instance.toJSON();
        expect(obj).not.to.have.property('hidden');
      });

      it('should not strip private properties in unsafe mode', () => {
        let obj = instance.toJSON(true);
        expect(obj).to.have.property('hidden');
      });

      it('should be called by JSON.stringify', () => {
        let serialised = JSON.stringify(instance);
        let obj = JSON.parse(serialised);
        expect(obj).not.to.have.property('hidden');
      });
    });
  });
});
