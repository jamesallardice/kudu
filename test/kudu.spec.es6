import chai from 'chai';
import Kudu from '../src/kudu';
import BaseModel from '../src/model';

let expect = chai.expect;

describe('Kudu', () => {

  let kudu;

  beforeEach(() => {
    kudu = new Kudu();
  });

  it('should expose a constructor function', () => {
    expect(Kudu).to.be.a('function');
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
