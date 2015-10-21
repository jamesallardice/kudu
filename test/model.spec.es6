import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Kudu from '../src/kudu';
import BaseModel from '../src/model';

chai.use(chaiAsPromised);
let expect = chai.expect;

describe('Model', () => {

  let kudu;

  beforeEach(() => {
    kudu = new Kudu();
  });

  it('should expose the singular name on the constructor', () => {
    let Model = kudu.createModel('test', {});
    expect(Model).to.have.property('singular', 'test');
  });

  it('should expose the plural name on the constructor', () => {
    let Model = kudu.createModel('test', 'tests', {});
    expect(Model).to.have.property('plural', 'tests');
  });

  it('should default the plural name to singular name plus "s"', () => {
    let Model = kudu.createModel('test', {});
    expect(Model).to.have.property('plural', 'tests');
  });

  it('should expose the schema on the constructor', () => {
    let schema = {};
    let Model = kudu.createModel('test', schema);
    expect(Model.schema).to.equal(schema);
  });

  describe('static get', () => {

    let Model;

    beforeEach(() => {
      Model = kudu.createModel('test', {
        properties: {},
      });
    });

    it('should fail when no identifier is provided', () => {
      return expect(Model.get()).to.be.rejectedWith(Error, /identifier/);
    });
  });

  describe('instances', () => {

    let Model;

    beforeEach(() => {
      Model = kudu.createModel('test', {});
    });

    it('should inherit from the base Model constructor', () => {
      expect(new Model()).to.be.an.instanceOf(BaseModel);
    });

    it('should map provided data onto the instance', () => {
      expect(new Model({ id: 1 })).to.have.property('id', 1);
    });
  });

  describe('#save', () => {

    let Model;

    beforeEach(() => {
      Model = kudu.createModel('test', {
        properties: {
          name: {
            type: String,
            required: true,
          },
        },
      });
    });

    it('should return a promise', () => {
      let instance = new Model();
      expect(instance.save()).to.be.an.instanceOf(Promise);
    });

    it('should fail when the model is invalid', () => {
      let instance = new Model();
      return expect(instance.save()).to.be.rejectedWith(Error, /required/);
    });

    it('should add a "type" property when one is not present', () => {
      let instance = new Model({ name: 'test' });
      return expect(instance.save()).to.eventually.have.property('type', 'test');
    });

    it('should succeed when the model is valid', () => {
      let instance = new Model({ type: 'test', name: 'test' });
      return expect(instance.save()).to.be.fulfilled;
    });

    it('should merge properties generated by the adapter with the model', () => {
      let instance = new Model({ type: 'test', name: 'test' });
      return expect(instance.save()).to.eventually.have.property('id');
    });
  });

  describe('#update', () => {

    let Model;
    let instance;

    beforeEach(() => {
      Model = kudu.createModel('test', {
        properties: {
          name: {
            type: String,
            required: true,
          },
        },
      });
      instance = new Model({
        type: 'test',
        name: 'test',
      });
      return instance.save();
    });

    it('should return a promise', () => {
      expect(instance.update()).to.be.an.instanceOf(Promise);
    });

    it('should fail when the model is invalid', () => {
      let instance = new Model();
      return expect(instance.update()).to.be.rejectedWith(Error, /required/);
    });

    it('should return the updated instance', () => {
      return expect(instance.update()).to.eventually.become(instance);
    });
  });

  describe('#delete', () => {

    let Model;

    beforeEach(() => {
      Model = kudu.createModel('test', {
        properties: {
          name: {
            type: String,
            required: true,
          },
        },
      });
    });

    it('should return a promise', () => {
      let instance = new Model({ type: 'test', name: 'test' });
      expect(instance.delete()).to.be.an.instanceOf(Promise);
    });

    it('should return the deleted instance', () => {
      let instance = new Model({ type: 'test', name: 'test' });
      expect(instance.delete()).to.be.eventually.become(instance);
    });
  });

  describe('#toJSON', () => {

    let Model;
    let instance;

    beforeEach(() => {
      Model = kudu.createModel('test', {
        properties: {
          name: {
            type: String,
            required: true,
          },
        },
      });
      instance = new Model({ type: 'test', name: 'test' });
    });

    it('should remove the reference to the Kudu app from the instance', () => {
      expect(instance.toJSON()).not.to.have.property('app');
    });

    it('should allow serialisation of the resulting object', () => {
      expect(JSON.stringify(instance.toJSON())).to.be.a('string');
    });
  });
});
