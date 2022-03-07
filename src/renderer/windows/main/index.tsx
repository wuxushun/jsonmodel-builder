import React from 'react';
import { Input, message } from 'antd';
import _ from 'lodash';
import Header from '../../components/header';
import Footer from '../../components/footer';
import styles from './index.module.scss';
import Builder from '../../core/Builder';

const { TextArea } = Input;

function isJsonObject(value: any): boolean {
  if (_.isPlainObject(value)) {
    return false;
  }
  try {
    const result = JSON.parse(value);
    return _.isPlainObject(result);
  } catch (error) {
    return false;
  }
}

function safeStringify(value: any) {
  if (_.isPlainObject(value)) {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
}

const Main = () => {
  const [originJson, setOriginJson] = React.useState('');
  const [output, setOutput] = React.useState('');
  const onExchangePress = (values: any) => {
    if (!isJsonObject(originJson)) {
      message.error('json数据格式错误');
      return;
    }
    const format: any = {};
    if (values.indentType === 0) {
      format.indent_with_tabs = true;
      format.indent_size = 4;
    }
    if (values.indentType === 1) {
      format.indent_size = 2;
    }
    if (values.indentType === 2) {
      format.indent_size = 4;
    }
    const result = new Builder(values.moduleType)
      .makeFileRight()
      .makeImport()
      .makeDeine(values.mainMoudleName, safeStringify(originJson))
      .format(format)
      .execute();

    setOutput(result);
  };
  const onOriginChange = (e: any) => {
    setOriginJson(e.target.value);
  };
  return (
    <div className={styles.page}>
      <Header onExchangePress={onExchangePress} />
      <div className={styles.content}>
        <TextArea
          value={originJson}
          placeholder="请输入json字符串"
          onChange={onOriginChange}
        />
        <TextArea value={output} />
      </div>
      <Footer />
    </div>
  );
};

export default Main;
