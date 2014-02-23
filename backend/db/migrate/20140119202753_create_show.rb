class CreateShow < ActiveRecord::Migration
  def change
    create_table :shows do |t|
      t.integer :api_id
      t.string  :title
      t.string  :image_url
      t.string  :show_started
      t.string  :show_ended
      t.boolean :in_production
    end
  end
end
