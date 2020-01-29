import BootstrapVue from 'bootstrap-vue'
import { mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'

import SubTitle from '@/components/SubTitle.vue'

const localVue = createLocalVue()
localVue.use(BootstrapVue)

describe('SubTitle.vue', () => {
  it('renders a SubTitle component', () => {
    const subtitle = 'test subtitle'
    const wrapper = mount(SubTitle, {localVue, propsData:{subtitle}})
    expect(wrapper.attributes()).toMatchObject({class: 'subtitle container'})
    expect(wrapper.find('div.subtitle').find('span.subtitle').text()).toMatch(subtitle)
    expect(wrapper.find('div.subtitle').find('a.back').text()).toMatch('戻る')
  })

  it('has a back button which links to stocks page', () => {
    const wrapper = mount(SubTitle, {localVue, stubs: {BButton: RouterLinkStub}})
    const links = wrapper.findAll(RouterLinkStub)
    expect(links.length).toBe(1)
    expect(links.at(0).props().to).toMatchObject({name: 'stocks'})
  })
})
