import { useState } from 'react';
import { Form, Row, Col, Input, Button, Select } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { ModuleType } from '../../core/Builder';

const { Option } = Select;

interface IAdvancedForm {
  onExchangePress: (values: any) => void;
}

enum FieldComponent {
  input,
  select,
}

export enum IndentType {
  with_tabs,
  two_space,
  four_space,
}

const moduleList = [
  {
    value: ModuleType.cjs,
    label: 'cjs规范',
  },
  {
    value: ModuleType.esm,
    label: 'esm规范',
  },
];

const indentList = [
  {
    value: IndentType.with_tabs,
    label: '使用Tab缩进',
  },
  {
    value: IndentType.four_space,
    label: '4个空格缩进',
  },
  {
    value: IndentType.two_space,
    label: '2个空格缩进',
  },
];

const defaultSets = {
  mainMoudleName: {
    label: '主模块名称',
    value: 'jsonModel',
    component: FieldComponent.input,
  },
  moduleType: {
    label: '模块类型',
    value: ModuleType.esm,
    list: moduleList,
    component: FieldComponent.select,
  },
  indentType: {
    label: '缩进类型',
    value: IndentType.with_tabs,
    list: indentList,
    component: FieldComponent.select,
  },
};

const AdvancedForm = (props: IAdvancedForm) => {
  const [form] = Form.useForm();
  const { onExchangePress } = props;

  const getFields = () => {
    const childrens: any = [];
    Object.entries(defaultSets).forEach((sub: any, i: number) => {
      const [key, value] = sub;
      childrens.push(
        <Col span={8} key={key}>
          <Form.Item name={key} label={value.label} initialValue={value.value}>
            {value.component === FieldComponent.input ? (
              <Input placeholder={`请输入${value.label}`} />
            ) : (
              <Select defaultValue={value.value}>
                {value.list.map((item: any) => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
      );
    });
    return childrens;
  };

  const onFinish = (values: any) => {
    onExchangePress(values);
  };

  return (
    <Form
      form={form}
      name="advanced_search"
      className="ant-advanced-search-form"
      onFinish={onFinish}
    >
      <Row gutter={24}>{getFields()}</Row>
      <Row>
        <Col span={24} style={{ textAlign: 'right' }}>
          <Button type="primary" htmlType="submit">
            开始转换
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

const Header = (props: any) => {
  const { onExchangePress } = props;
  return (
    <div className={styles.container}>
      <AdvancedForm onExchangePress={onExchangePress} />
    </div>
  );
};

export default Header;
