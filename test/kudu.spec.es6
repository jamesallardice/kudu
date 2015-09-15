import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Kudu from '../src/kudu';
import BaseModel from '../src/model';
import MemoryAdapter from '../src/adapter';

chai.use(chaiAsPromised);
let expect = chai.expect;

describe('Kudu', () => {

  let kudu;

  beforeEach(() => {
    kudu = new Kudu();
  });

  it('should expose a constructor function', () => {
    expect(Kudu).to.be.a('function');
  });

  it('should throw an error when given invalid adapter config', () => {
    let test = () => new Kudu({}, { adapter: {} });
    expect(test).to.throw(Error, /config/);
  });

  it('should expose an instance of the in-memory adapter by default', () => {
    expect(kudu.db).to.be.an.instanceOf(MemoryAdapter);
  });

  describe('#createModel', () => {

    it('should throw an error if not passed a schema object', () => {
      let test = () => kudu.createModel('test');
      expect(test).to.throw(Error, /schema/);
    });

    it('should return a constructor when passed valid arguments', () => {
      expect(kudu.createModel('test', {})).to.be.a('function');
    });

    it('should not treat a plural name as a schema', () => {
      expect(kudu.createModel('test', 'tests', {})).to.be.a('function');
    });

    it('should add the model to the model cache', () => {
      let Model = kudu.createModel('test', {});
      expect(kudu.models.get('test')).to.equal(Model);
    });

    it('should add the model to the pluralised model cache', () => {
      let Model = kudu.createModel('test', {});
      expect(kudu.modelsByPluralName.get('tests')).to.equal(Model);
    });
  });

  describe('#getModel', () => {

    it('should return a model constructor from the model cache', () => {
      let Model = kudu.createModel('test', {});
      expect(kudu.getModel('test')).to.equal(Model);
    });

    it('should return undefined when no model matches the given name', () => {
      expect(kudu.getModel('fail')).to.be.undefined;
    });
  });

  describe('Model', () => {

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

      it('should succeed when the model is valid', () => {
        let instance = new Model({ name: 'test' });
        return expect(instance.save()).to.be.fulfilled;
      });
    });
  });

  describe('Model instances', () => {

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
});
