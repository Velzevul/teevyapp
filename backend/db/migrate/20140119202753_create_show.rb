class CreateShow < ActiveRecord::Migration
  def change
    create_table :shows do |t|
      t.string :title
      t.string :image_url
      t.string :show_started
      t.string :show_ended
    end
  end
end
