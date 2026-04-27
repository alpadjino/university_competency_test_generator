import { Competencies } from "./Competencies";
import { Test } from "./Tests";

Competencies.belongsToMany(Test, {
  through: 'test_competencies',
  foreignKey: 'competency_id',
  otherKey: 'test_id',
  timestamps: false,
});

Test.belongsToMany(Competencies, {
  through: 'test_competencies',
  foreignKey: 'test_id',
  otherKey: 'competency_id',
  as: { singular: 'competency', plural: 'competencies' },
  timestamps: false,
});

